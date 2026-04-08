import Link from "next/link";

export default function Home() {
  return (
    <section className="rounded-2xl border bg-white p-8 shadow-sm sm:p-10">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Practice Next.js
      </p>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
        Cooking Recipes Management
      </h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Create new recipes, like them, and post comments as required in the assignment. Data is stored in Neon Postgres and ready for Vercel deployment.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/recipes"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Browse Recipes
        </Link>
        <Link
          href="/recipes/new"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
        >
          Create Recipe
        </Link>
      </div>
    </section>
  );
}
