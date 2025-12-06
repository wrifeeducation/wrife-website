import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />

      <main className="px-4 md:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--wrife-text-main)" }}
          >
            Welcome to WriFe
          </h1>
          <p
            className="text-lg md:text-xl"
            style={{ color: "var(--wrife-text-muted)" }}
          >
            Writing for Everyone - Learn, practice, and master writing skills
          </p>
        </div>
      </main>
    </div>
  );
}
