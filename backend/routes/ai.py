import os
import json
import re

from fastapi import APIRouter, Depends, HTTPException

from db import db_fetch
from dependencies import get_current_user
from models import ChatRequest

router = APIRouter()

DISCLAIMER = "This is informational only and not a substitute for professional medical advice."


def _require_patient(user: dict) -> int:
    if user.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access required")
    return user["patient_id"]


def _build_context(patient_id: int) -> str:
    appointments = db_fetch(
        """SELECT a.appt_id, a.scheduled_dt, a.actual_dt, a.status, a.notes,
                  hp.first_name || ' ' || hp.last_name AS doctor
           FROM appointment a
           JOIN healthcare_professional hp ON hp.hp_id = a.hp_id
           WHERE a.patient_id = %s ORDER BY a.scheduled_dt DESC""",
        (patient_id,),
    )

    diag_map: dict = {}
    rx_map: dict = {}
    for appt in appointments:
        diags = db_fetch(
            "SELECT diag_id, icd_code, description, severity FROM diagnosis WHERE appt_id = %s",
            (appt["appt_id"],),
        )
        diag_map[appt["appt_id"]] = diags
        for d in diags:
            rxs = db_fetch(
                "SELECT medication, dosage, frequency, duration_days FROM prescription WHERE diag_id = %s",
                (d["diag_id"],),
            )
            rx_map[d["diag_id"]] = rxs

    labs = db_fetch(
        "SELECT test_name, result, ref_range, status, ordered_at FROM lab_investigation WHERE patient_id = %s ORDER BY ordered_at DESC",
        (patient_id,),
    )

    records = db_fetch(
        """SELECT cr.visit_date, cr.chief_complaint, cr.notes, cr.type,
                  hp.first_name || ' ' || hp.last_name AS doctor
           FROM clinical_record cr
           JOIN healthcare_professional hp ON hp.hp_id = cr.hp_id
           WHERE cr.patient_id = %s ORDER BY cr.visit_date DESC""",
        (patient_id,),
    )

    lines = ["=== APPOINTMENTS ==="]
    for a in appointments:
        lines.append(f"- [{a['status']}] {str(a['scheduled_dt'])[:16]} with Dr. {a['doctor']}")
        if a["notes"]:
            lines.append(f"  Notes: {a['notes']}")
        for d in diag_map.get(a["appt_id"], []):
            lines.append(f"  Diagnosis: {d['description']} (ICD: {d['icd_code']}, severity: {d['severity']})")
            for rx in rx_map.get(d["diag_id"], []):
                lines.append(f"    Rx: {rx['medication']} {rx['dosage']} {rx['frequency']} for {rx['duration_days']} days")

    lines.append("\n=== LAB RESULTS ===")
    for lab in labs:
        result_str = f"Result: {lab['result']}" if lab["result"] else "Result: Pending"
        lines.append(f"- {lab['test_name']} ({str(lab['ordered_at'])[:10]}): {result_str} | Ref: {lab['ref_range'] or 'N/A'} | Status: {lab['status']}")

    lines.append("\n=== CLINICAL RECORDS ===")
    for r in records:
        lines.append(f"- {r['visit_date'][:10] if isinstance(r['visit_date'], str) else str(r['visit_date'])[:10]} with Dr. {r['doctor']} [{r['type'] or 'General'}]")
        if r["chief_complaint"]:
            lines.append(f"  Complaint: {r['chief_complaint']}")
        if r["notes"]:
            lines.append(f"  Notes: {r['notes']}")

    if not appointments and not labs and not records:
        return "No medical records found for this patient yet."

    return "\n".join(lines)


def _get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI client init failed: {e}")


def _call_gemini(client, prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")


def _parse_reply(raw: str) -> tuple[str, list[str]]:
    """Split suggested_questions JSON block out of the raw Gemini reply."""
    match = re.search(r'\{[^{}]*"suggested_questions"\s*:\s*\[.*?\][^{}]*\}', raw, re.DOTALL)
    if match:
        reply = raw[:match.start()].strip()
        try:
            data = json.loads(match.group())
            questions = data.get("suggested_questions", [])[:3]
            return reply, questions
        except json.JSONDecodeError:
            pass
    return raw.strip(), []


SYSTEM_PREAMBLE = """You are a helpful medical AI assistant for ClinIQ.
You are speaking directly with a patient. Their complete medical data is provided below.
Answer only based on the provided data. Be clear, compassionate, and concise.
Use markdown formatting: bold for medication names, bullet lists for multiple items.
At the very end of your response, on a new line, output exactly this JSON (no markdown fences):
{{"suggested_questions": ["question 1", "question 2", "question 3"]}}
The suggested questions should be relevant follow-ups based on the patient's data and your answer.
Always include the disclaimer: "{disclaimer}"

--- PATIENT MEDICAL CONTEXT ---
{{context}}
--- END CONTEXT ---
"""


@router.post("/summary")
def ai_summary(user: dict = Depends(get_current_user)):
    patient_id = _require_patient(user)
    context = _build_context(patient_id)
    client = _get_gemini_client()

    prompt = (
        SYSTEM_PREAMBLE.format(disclaimer=DISCLAIMER).replace("{context}", context)
        + "\n\nPlease generate a structured health summary for this patient covering: "
        "Overview, Active Conditions, Current Medications, Recent Lab Results, and Recent Visits."
    )

    raw = _call_gemini(client, prompt)
    summary, _ = _parse_reply(raw)
    return {"summary": summary, "disclaimer": DISCLAIMER}


@router.post("/chat")
def ai_chat(body: ChatRequest, user: dict = Depends(get_current_user)):
    patient_id = _require_patient(user)
    context = _build_context(patient_id)
    client = _get_gemini_client()

    history_text = ""
    for msg in body.history[-10:]:  # last 10 turns to stay within context window
        role_label = "Patient" if msg.role == "user" else "Assistant"
        history_text += f"\n{role_label}: {msg.content}"

    prompt = (
        SYSTEM_PREAMBLE.format(disclaimer=DISCLAIMER).replace("{context}", context)
        + (f"\n\n--- CONVERSATION HISTORY ---{history_text}\n--- END HISTORY ---" if history_text else "")
        + f"\n\nPatient: {body.message}\nAssistant:"
    )

    raw = _call_gemini(client, prompt)
    reply, suggested = _parse_reply(raw)

    if len(suggested) < 3:
        suggested = (suggested + [
            "What are my current medications?",
            "Can you summarize my recent lab results?",
            "What follow-up appointments do I have?",
        ])[:3]

    return {"reply": reply, "suggested_questions": suggested, "disclaimer": DISCLAIMER}
