import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center font-bold text-navy-900 text-sm">
              MS
            </div>
            <span className="font-bold text-lg tracking-tight">Método Stack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
          Ferramenta estratégica de comunidades
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Você está prestes a construir{' '}
          <span className="text-gold-400">algo que poucas marcas</span>{' '}
          sabem fazer de verdade.
        </h1>

        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Não um grupo. Não uma audiência. Uma comunidade. O Método Stack vai te guiar pela
          construção completa: do propósito até o plano de ação.
        </p>

        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:scale-105"
        >
          Construir minha comunidade
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

      {/* Differentials */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '◈',
              title: '3 Pilares',
              desc: 'Essência, Movimento e Operação: as três camadas que toda comunidade precisa.',
            },
            {
              icon: '◉',
              title: '30 Perguntas',
              desc: 'Perguntas estratégicas que guiam você do mais fundamental ao mais operacional.',
            },
            {
              icon: '◎',
              title: '2 Documentos',
              desc: 'Blueprint e Plano de Ação: o projeto completo na plataforma, pronto para exportar.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-gold-400 text-3xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Intro text blocks */}
      <section className="max-w-3xl mx-auto px-6 pb-32 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">A diferença é simples.</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Audiência consome o que você produz. Comunidade constrói junto com você. Audiência some
            quando você para de postar. Comunidade continua existindo porque as pessoas se importam
            umas com as outras, não só com você.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Comunidade de clientes',
            'Comunidade de creators',
            'Comunidade de aprendizado',
            'Comunidade de parceiros',
            'Comunidade interna',
            'Comunidade de nicho',
          ].map((type) => (
            <div key={type} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <span className="text-gold-400 text-sm">✓</span>
              <span className="text-sm text-white/80">{type}</span>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <p className="text-white/50 text-sm mb-6">
            Independente do tipo, toda comunidade precisa das mesmas camadas.
            <br />É isso que o Método Stack organiza para você.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
          >
            Começar agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-white/40 text-sm">
        © {new Date().getFullYear()} Método Stack · Criado por Angelo Silva · @angelosilva.co
      </footer>
    </main>
  )
}
