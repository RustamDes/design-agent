import { useNavigate } from "react-router";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Design Agent</h1>
      <p className="text-[var(--color-text-secondary)]">
        AI-powered tool for product designers
      </p>
      <button
        onClick={() => navigate("/research")}
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "10px 24px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--color-accent-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--color-accent)";
        }}
      >
        Открыть Discovery Agent
      </button>
    </main>
  );
}
