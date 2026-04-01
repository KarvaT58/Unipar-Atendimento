export default function FooterSection() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border/40 bg-background py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-center"
      role="contentinfo"
    >
      <p className="text-sm font-normal tracking-normal text-muted-foreground">
        © {year} Todos os direitos reservados
      </p>
    </footer>
  )
}
