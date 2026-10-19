import os
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

pool = ThreadedConnectionPool(1, 10, dsn=os.getenv("DATABASE_URL"))


@contextmanager
def get_conn():
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)


def db_fetch(sql, params=()):
    with get_conn() as conn:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(sql, params)
        return [dict(r) for r in cur.fetchall()]


def db_exec(sql, params=()):
    """Execute INSERT/UPDATE/DELETE with RETURNING * and commit. Returns single dict."""
    with get_conn() as conn:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(sql, params)
        conn.commit()
        row = cur.fetchone()
        return dict(row) if row else {}


def db_run(sql, params=()):
    """Execute statement with no RETURNING clause (e.g. DELETE without RETURNING)."""
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
