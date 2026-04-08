import Link from "next/link";

const links = [
	{ href: "/", label: "Home" },
	{ href: "/recipes", label: "Recipes" },
	{ href: "/recipes/new", label: "New" },
];

export function Header() {
	return (
		<header className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
				<Link href="/" className="text-lg font-bold tracking-tight">
					Recipe Manager
				</Link>

				<nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-slate-700 transition-colors hover:text-slate-950"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
