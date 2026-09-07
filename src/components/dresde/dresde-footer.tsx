export function DresdeFooter() {
  return (
    <footer className="border-t border-dresde-line px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <span className="font-display text-heading font-extrabold uppercase text-dresde-paper">
            Dresde
          </span>
          <p className="max-w-[32ch] font-sans text-small text-dresde-paper-dim">
            Más que un corte, una experiencia.
          </p>
        </div>

        <a
          href="#locales"
          className="inline-flex min-h-11 items-center border border-dresde-line-strong px-4 font-sans text-label uppercase tracking-[0.14em] text-dresde-paper-dim transition-colors duration-(--duration-fast) ease hover:border-dresde-brass hover:text-dresde-brass"
        >
          Ver sucursales
        </a>
      </div>

      <p className="mt-12 font-sans text-caption uppercase tracking-[0.1em] text-dresde-mute">
        © {new Date().getFullYear()} Dresde. Todos los derechos reservados.
      </p>
    </footer>
  );
}
