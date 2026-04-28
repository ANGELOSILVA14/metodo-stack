export interface Question {
  id: string
  text: string
  support: string
}

export interface Etapa {
  number: number
  name: string
  description: string
  questions: Question[]
}

export interface Pilar {
  number: number
  name: string
  subtitle: string
  intro: string
  etapas: Etapa[]
}

export interface ActionPlanQuestion {
  id: string
  number: number
  text: string
  support: string
}

export const PILARES: Pilar[] = [
  {
    number: 1,
    name: 'Essência',
    subtitle: 'O que a comunidade é',
    intro: `Antes de pensar em plataforma, conteúdo ou crescimento, você precisa saber quem é a sua comunidade.

A Essência é o coração do Método Stack. É aqui que você define o propósito que vai unir pessoas, o perfil de quem pertence a esse grupo e a identidade que vai fazer sua comunidade ser reconhecida e lembrada.

Comunidades sem Essência clara existem por um tempo, mas não duram. As pessoas entram, olham ao redor e não encontram nada que as faça ficar. Sem propósito, sem tribo, sem identidade, uma comunidade é só mais um grupo com nome bonito.

Quando a Essência está no lugar, tudo fica mais fácil. O conteúdo certo aparece naturalmente. As pessoas certas chegam. E quem não deveria estar lá não fica.

Responda esse pilar como se estivesse descrevendo a alma da sua comunidade.`,
    etapas: [
      {
        number: 1,
        name: 'Propósito',
        description: `Toda comunidade que dura tem uma razão de existir que vai além do produto ou serviço. O propósito é o que une pessoas que nunca se viram antes e faz com que elas se sintam parte de algo maior.

Sem propósito claro, sua comunidade vira um grupo de suporte. Com propósito claro, ela vira um movimento.`,
        questions: [
          {
            id: 'e1q1',
            text: 'Qual problema essa comunidade resolve para seus membros?',
            support: 'Pense no que incomoda, frustra ou falta na vida das pessoas que você quer reunir. O problema pode ser prático, como aprender uma habilidade, ou emocional, como se sentir parte de algo. Ex: "Empreendedores(as) solo que se sentem isolados(as) e precisam de troca com quem vive os mesmos desafios."',
          },
          {
            id: 'e1q2',
            text: 'Como a vida do(a) membro(a) muda depois que ele(a) entra?',
            support: 'Descreva a transformação. Não o que sua comunidade oferece, mas o que muda na vida real de quem participa. Ex: "Ele(a) para de tomar decisões sozinho(a) e passa a ter uma rede de referência para crescer mais rápido."',
          },
          {
            id: 'e1q3',
            text: 'Em uma frase, qual é a razão de existir dessa comunidade?',
            support: 'Essa é a sua frase de propósito. Ela precisa ser simples o suficiente para qualquer membro repetir para alguém de fora. Ex: "Existimos para que nenhum(a) empreendedor(a) precise crescer sozinho(a)."',
          },
        ],
      },
      {
        number: 2,
        name: 'Tribo',
        description: `Comunidade não é para todo mundo. Quanto mais claro você for sobre para quem é, mais fácil será atrair as pessoas certas e mais forte será o senso de pertencimento.

Definir sua tribo não é excluir pessoas. É garantir que quem entra se sinta verdadeiramente em casa.`,
        questions: [
          {
            id: 'e2q1',
            text: 'Quais características todos os seus membros compartilham?',
            support: 'Pense além de dados demográficos como idade e localização. O que une essas pessoas de verdade? Pode ser uma crença, um estilo de vida, uma ambição ou um desafio em comum. Ex: "Todos(as) acreditam que comunidade é estratégia de negócio, não ação de marketing."',
          },
          {
            id: 'e2q2',
            text: 'Como você descreveria seu(sua) membro(a) ideal em uma linha?',
            support: 'Seja específico(a). Quanto mais precisa for essa descrição, mais fácil será criar conteúdo, experiências e comunicação que ressoam. Ex: "Gestores(as) de marketing de médias empresas que querem transformar clientes em comunidade."',
          },
          {
            id: 'e2q3',
            text: 'Existe algum perfil de pessoa que não pertence a essa comunidade?',
            support: 'Essa pergunta parece difícil, mas é libertadora. Saber quem não é seu(sua) membro(a) te ajuda a manter a qualidade e a coerência da comunidade ao longo do tempo. Ex: "Pessoas que buscam apenas conteúdo passivo sem querer contribuir com o grupo."',
          },
        ],
      },
      {
        number: 3,
        name: 'Marca',
        description: `A identidade da sua comunidade é o que faz as pessoas se sentirem parte de algo único. Um nome que representa, uma linguagem que conecta e uma forma de se expressar que diferencia sua comunidade de qualquer outra.

Comunidades fortes têm uma identidade tão clara que os membros a carregam para fora, nas conversas, no jeito de se apresentar e até no que vestem.`,
        questions: [
          {
            id: 'e3q1',
            text: 'Qual é o nome da comunidade e o que ele representa?',
            support: 'O nome precisa ter significado para quem pertence. Pode ser literal, metafórico ou inventado, mas precisa carregar a essência do grupo. Ex: "Lane One, porque nadadores(as) sérios(as) nadam sempre na raia um, a raia dos mais rápidos."',
          },
          {
            id: 'e3q2',
            text: 'Como os membros se chamam entre si e qual é o tom de comunicação?',
            support: 'Comunidades fortes têm um jeito próprio de falar. Isso inclui como os membros se referem uns aos outros e o tom geral das conversas — se é mais formal, descontraído, técnico ou inspirador. Ex: "Os membros se chamam de Stackers e o tom é direto, prático e sem firula."',
          },
          {
            id: 'e3q3',
            text: 'Quais palavras ou expressões são da casa e reforçam a identidade?',
            support: 'Toda comunidade cria sua própria linguagem com o tempo. Você pode acelerar isso definindo termos, expressões ou conceitos que só fazem sentido para quem é de dentro. Ex: "Usamos \'raiar\' para quando alguém tem um grande avanço e \'mergulho\' para os encontros ao vivo."',
          },
        ],
      },
    ],
  },
  {
    number: 2,
    name: 'Movimento',
    subtitle: 'O que a comunidade faz',
    intro: `Uma comunidade sem movimento é uma comunidade morta.

É aqui que você define como as pessoas entram, como são recebidas, o que acontece no dia a dia, quais rituais criam pertencimento, como os membros evoluem e como a comunidade se renova ao longo do tempo.

O Movimento é o que transforma um grupo de pessoas com interesses em comum em uma comunidade viva. É o que faz alguém acordar na segunda-feira querendo participar. É o que cria as histórias que os membros contam para os outros lá fora.

Muitas comunidades têm uma boa Essência mas travam aqui. Definem quem são, mas não sabem o que fazer com as pessoas depois que elas entram. O resultado é um grupo bonito no papel e silencioso na prática.

Esse pilar vai te forçar a pensar na experiência do(a) membro(a), não só na sua como gestor(a).`,
    etapas: [
      {
        number: 4,
        name: 'Porta de Entrada',
        description: `A primeira experiência do(a) membro(a) define tudo. Se a entrada for confusa, fria ou sem direção, a pessoa entra e some. Se for acolhedora, clara e estimulante, ela fica e começa a contribuir.

A Porta de Entrada não é só sobre boas-vindas. É sobre fazer o(a) novo(a) membro(a) sentir que chegou ao lugar certo.`,
        questions: [
          {
            id: 'e4q1',
            text: 'Essa comunidade é aberta ou fechada?',
            support: 'Comunidades abertas aceitam qualquer pessoa interessada. Comunidades fechadas têm critérios de entrada, como pagamento, convite ou aprovação. Cada modelo tem vantagens: abertas crescem mais rápido, fechadas têm mais qualidade e engajamento. Ex: "Fechada, com acesso mediante assinatura mensal e aprovação de perfil."',
          },
          {
            id: 'e4q2',
            text: 'Como é o processo de boas-vindas e o que acontece nos primeiros dias?',
            support: 'Os primeiros 7 dias são críticos. O(a) membro(a) precisa entender onde está, o que pode fazer e sentir que foi notado(a). Pense em uma sequência de ações que transformam um(a) estranho(a) em participante ativo(a). Ex: "No primeiro dia recebe uma mensagem pessoal do(a) gestor(a). Na primeira semana é convidado(a) para se apresentar e indicar um desafio atual."',
          },
          {
            id: 'e4q3',
            text: 'Quais são os primeiros passos que o(a) novo(a) membro(a) deve dar para se sentir parte?',
            support: 'Defina 2 ou 3 ações concretas que qualquer novo(a) membro(a) deve fazer logo no início. Isso reduz a paralisia e acelera o engajamento. Ex: "Preencher o perfil, se apresentar no canal de boas-vindas e participar do próximo encontro ao vivo."',
          },
        ],
      },
      {
        number: 5,
        name: 'Pulso',
        description: `O pulso é o ritmo da sua comunidade. É o que faz ela ter vida própria, com atividades que os membros esperam e rituais que criam memórias compartilhadas.

Uma comunidade sem pulso é silenciosa. E silêncio, em comunidade, é sinal de morte.`,
        questions: [
          {
            id: 'e5q1',
            text: 'Quais são as experiências fixas e recorrentes que a comunidade oferece?',
            support: 'Pense em encontros, calls, desafios, conteúdos ou qualquer atividade que acontece com regularidade. A recorrência é o que cria hábito e antecipação nos membros. Ex: "Call semanal às terças, desafio mensal com premiação e newsletter exclusiva toda sexta."',
          },
          {
            id: 'e5q2',
            text: 'Com que frequência as atividades acontecem para manter o engajamento vivo?',
            support: 'Frequência demais esgota. Frequência de menos esquece. Encontre o ritmo que respeita o tempo dos seus membros e mantém a comunidade presente na rotina deles. Ex: "Uma atividade por semana obrigatória e conteúdo diário opcional no canal principal."',
          },
          {
            id: 'e5q3',
            text: 'Existe algo exclusivo que só quem é membro tem acesso?',
            support: 'A exclusividade cria valor e senso de pertencimento. Pode ser conteúdo, acesso antecipado, eventos fechados ou qualquer coisa que faça o(a) membro(a) sentir que estar dentro vale a pena. Ex: "Acesso a um banco de templates, sessões de mentoria em grupo e desconto em parceiros da comunidade."',
          },
        ],
      },
      {
        number: 6,
        name: 'Protagonismo',
        description: `Comunidades que dependem apenas do(a) gestor(a) para funcionar têm um teto. Quando os membros assumem papéis e se tornam protagonistas, a comunidade ganha vida própria e escala sem esgotar quem lidera.

O protagonismo é o que transforma membros passivos em pessoas investidas no sucesso coletivo.`,
        questions: [
          {
            id: 'e6q1',
            text: 'Quais são os diferentes níveis ou papéis dentro da comunidade?',
            support: 'Pense em como um(a) membro(a) pode evoluir dentro da comunidade. Pode ser por engajamento, contribuição, tempo de casa ou habilidades. Ter níveis cria progressão e motivação. Ex: "Membro, Colaborador(a), Embaixador(a). Cada nível tem benefícios e responsabilidades diferentes."',
          },
          {
            id: 'e6q2',
            text: 'Como um(a) membro(a) evolui de passivo(a) para ativo(a)?',
            support: 'Defina o caminho. O que precisa acontecer para alguém deixar de consumir e começar a contribuir? Quanto mais claro esse caminho, mais fácil será guiar os membros por ele. Ex: "Participa de 3 encontros, completa o desafio do mês e se voluntaria para apresentar algo no próximo encontro."',
          },
          {
            id: 'e6q3',
            text: 'O que ganha quem assume um papel de liderança ou referência?',
            support: 'Reconhecimento é o combustível do protagonismo. Pode ser visibilidade, acesso exclusivo, benefícios financeiros ou simplesmente ser visto(a) como referência pelo grupo. Ex: "Embaixadores(as) têm acesso gratuito à comunidade, são divulgados(as) nos canais oficiais e participam de decisões estratégicas."',
          },
        ],
      },
      {
        number: 7,
        name: 'DNA',
        description: `O DNA é o que define como as pessoas se comportam dentro da sua comunidade. São os acordos, os valores em prática e a cultura que se forma com o tempo.

Comunidades sem DNA claro tendem a criar conflitos, perder identidade e atrair pessoas que não deveriam estar lá. Com DNA bem definido, a própria comunidade se autorregula.`,
        questions: [
          {
            id: 'e7q1',
            text: 'O que a comunidade espera de cada membro(a) e o que ele(a) pode esperar em troca?',
            support: 'Esse é o contrato não escrito da comunidade. Seja claro(a) sobre as expectativas dos dois lados. Ex: "Esperamos participação ativa e respeito. Em troca, o(a) membro(a) tem acesso a conteúdo exclusivo, suporte do grupo e visibilidade dentro da comunidade."',
          },
          {
            id: 'e7q2',
            text: 'O que é considerado comportamento fora dos limites e como é tratado?',
            support: 'Toda comunidade precisa de limites claros. Definir o que não é tolerado protege a cultura e dá segurança para todos os membros. Ex: "Spam, autopromoção sem contexto e desrespeito com outros membros resultam em advertência e, se repetido, exclusão."',
          },
          {
            id: 'e7q3',
            text: 'Os acordos são explícitos e formalizados ou vivem na cultura do grupo?',
            support: 'Não existe certo ou errado aqui. Alguns grupos funcionam bem com regras escritas e visíveis. Outros funcionam melhor com uma cultura forte que dispensa formalizações. O importante é ser consistente. Ex: "Temos um documento de boas práticas fixado no canal principal e reforçamos os valores no início de cada encontro."',
          },
        ],
      },
      {
        number: 8,
        name: 'Ciclo de Vida',
        description: `Membros entram, crescem, às vezes somem e novos chegam. Entender esse ciclo e ter estratégias para cada fase é o que mantém a comunidade saudável e em constante renovação.

Comunidades que não pensam no ciclo de vida dos membros perdem pessoas sem perceber e crescem sem qualidade.`,
        questions: [
          {
            id: 'e8q1',
            text: 'Como novos membros chegam até a comunidade e quem os indica?',
            support: 'Pense nas suas fontes de aquisição. Podem ser indicações de membros, conteúdo nas redes sociais, parcerias ou eventos. Saber de onde vêm os melhores membros ajuda a investir no canal certo. Ex: "70% dos novos membros chegam por indicação de membros ativos(as). Temos um programa de indicação com benefício para quem indica."',
          },
          {
            id: 'e8q2',
            text: 'Como a comunidade identifica e reengaja membros inativos?',
            support: 'Todo grupo tem membros que somem. Ter um processo para identificar e reconectar essas pessoas antes que saiam definitivamente é essencial para a saúde da comunidade. Ex: "Monitoramos presença nos encontros mensais. Quem fica 30 dias sem interagir recebe uma mensagem pessoal do(a) gestor(a)."',
          },
          {
            id: 'e8q3',
            text: 'Como a qualidade é mantida conforme a comunidade cresce?',
            support: 'Crescimento sem critério dilui a cultura. Pense em como você vai preservar o que faz sua comunidade especial mesmo quando ela for muito maior do que é hoje. Ex: "Mantemos processo de aprovação de novos membros e revisamos os acordos a cada 6 meses com os embaixadores(as)."',
          },
        ],
      },
    ],
  },
  {
    number: 3,
    name: 'Operação',
    subtitle: 'O que a comunidade precisa para durar',
    intro: `Comunidade boa sem estrutura dura pouco.

A Operação é o que mantém a comunidade funcionando quando o entusiasmo do início passa. É onde você define quem faz o quê, onde a comunidade vive, como as informações são organizadas e como o modelo financeiro sustenta tudo isso.

Esse é o pilar menos glamouroso e o mais negligenciado. A maioria das pessoas que cria uma comunidade pensa no propósito, planeja as experiências e esquece de estruturar a operação. Aí a comunidade cresce, o(a) gestor(a) esgota e tudo desmorona.

Uma comunidade bem operada parece simples por fora porque é sólida por dentro. As coisas acontecem, os membros são atendidos e o(a) gestor(a) consegue crescer sem depender de tudo estar nas suas mãos.

Esse pilar transforma sua comunidade de um projeto pessoal em um negócio sustentável.`,
    etapas: [
      {
        number: 9,
        name: 'Organização e Plataformas',
        description: `Uma comunidade bem organizada parece simples por fora. Por dentro, tem processos claros, responsabilidades definidas e uma plataforma que facilita a vida dos membros.

Sem organização, o(a) gestor(a) vira o gargalo de tudo. Com organização, a comunidade funciona mesmo nos dias em que você não está 100% presente.`,
        questions: [
          {
            id: 'e9q1',
            text: 'Quem são os responsáveis pela operação e quais tarefas não podem parar?',
            support: 'Liste as pessoas envolvidas na gestão e o que cada uma faz. Identifique as tarefas críticas que precisam acontecer toda semana independente de qualquer coisa. Ex: "A gestora principal cuida dos encontros e do conteúdo. Uma moderadora voluntária monitora o canal diário. As tarefas que não podem parar são a newsletter semanal e a aprovação de novos membros."',
          },
          {
            id: 'e9q2',
            text: 'Em qual plataforma a comunidade vive e como os membros se comunicam?',
            support: 'A plataforma precisa facilitar a vida dos membros, não complicar. Pense em onde seu público já está e o que atende melhor as necessidades da sua comunidade. Ex: "A comunidade vive no Circle para conteúdo e encontros e tem um grupo no WhatsApp para comunicações rápidas do dia a dia."',
          },
          {
            id: 'e9q3',
            text: 'Como as informações dos membros são organizadas e mantidas atualizadas?',
            support: 'Ter dados organizados sobre seus membros permite personalizar a experiência, identificar padrões e tomar decisões melhores. Ex: "Mantemos uma planilha atualizada mensalmente com nome, data de entrada, nível, engajamento e data do último contato."',
          },
        ],
      },
      {
        number: 10,
        name: 'Receita',
        description: `Comunidade que não se sustenta financeiramente não dura. Mas sustentabilidade financeira não significa necessariamente cobrar dos membros.

Existem dois modelos principais: comunidades autossustentáveis (financiadas pelos próprios membros) e comunidades financiadas (mantidas por uma empresa como investimento estratégico).

Independente do modelo, toda comunidade precisa de clareza financeira. Pensar em receita não é desvirtuar o propósito. É garantir que o propósito continue existindo.`,
        questions: [
          {
            id: 'e10q1',
            text: 'Qual é o modelo de receita da comunidade?',
            support: 'Existem vários modelos possíveis: mensalidade dos membros, patrocínio de marcas, eventos pagos, produtos exclusivos, comissão de parceiros, financiamento pela empresa ou uma combinação de todos. Ex: "Mensalidade mensal dos membros como receita principal e patrocínio de ferramentas relevantes para o nicho como receita complementar." Ou: "Financiada pela empresa como estratégia de retenção de clientes, sem cobrança dos membros."',
          },
          {
            id: 'e10q2',
            text: 'Quanto o(a) membro(a) paga e o que recebe em troca?',
            support: 'Se a comunidade for financiada pela empresa e não cobrar dos membros, descreva o que eles recebem de valor ao participar e o que a empresa investe para manter a comunidade funcionando. Se for paga, descreva o preço e o que está incluído. Ex: "R$ 197 por mês. Em troca: acesso a encontros semanais, banco de recursos exclusivos, rede de membros qualificados(as) e suporte direto da gestora."',
          },
          {
            id: 'e10q3',
            text: 'O modelo atual é sustentável a longo prazo e o que precisaria mudar para crescer?',
            support: 'Toda comunidade chega em um ponto onde o modelo precisa evoluir. Pensar nisso agora evita crises lá na frente. Ex: "O modelo atual sustenta até 200 membros. Acima disso, precisaremos contratar uma moderadora remunerada e migrar para uma plataforma mais robusta."',
          },
        ],
      },
    ],
  },
]

export const ACTION_PLAN_QUESTIONS: ActionPlanQuestion[] = [
  {
    id: 'ap1',
    number: 1,
    text: 'Você já tem uma audiência? Se sim, quantas pessoas aproximadamente?',
    support: 'Audiência aqui significa qualquer grupo de pessoas que já te acompanha ou tem contato com você: seguidores nas redes sociais, lista de e-mail, clientes, grupos em que você participa ou qualquer outra base. Isso vai definir de onde virão seus primeiros membros. Ex: "Tenho 3.200 seguidores no Instagram e uma lista de 800 e-mails de clientes."',
  },
  {
    id: 'ap2',
    number: 2,
    text: 'Qual é a data que você quer lançar a comunidade?',
    support: 'Não precisa ser uma data exata, mas quanto mais específico(a) você for, mais realista e acionável será o seu plano. Ex: "Quero lançar em 60 dias" ou "Tenho uma data definida: 15 de junho."',
  },
  {
    id: 'ap3',
    number: 3,
    text: 'Você vai lançar sozinho(a) ou tem alguém te ajudando na operação?',
    support: 'Saber com quantas pessoas você conta muda completamente o que é possível fazer no lançamento. Uma pessoa consegue menos do que um time, e tudo bem — o plano vai respeitar isso. Ex: "Vou lançar sozinho(a) por enquanto" ou "Tenho uma assistente que pode me ajudar 10 horas por semana."',
  },
  {
    id: 'ap4',
    number: 4,
    text: 'Qual é o orçamento disponível para o lançamento?',
    support: 'Não existe orçamento certo ou errado. Existe o que é real para você agora. Com orçamento zero o plano será diferente de um orçamento de R$ 2.000, mas ambos são possíveis. Ex: "Tenho cerca de R$ 500 para investir no lançamento" ou "Vou começar sem investimento financeiro."',
  },
  {
    id: 'ap5',
    number: 5,
    text: 'Quanto tempo por semana você pode dedicar à comunidade no início?',
    support: 'Seja realista. Muitas pessoas superestimam o tempo disponível e criam comunidades que não conseguem sustentar. O plano vai ser montado com base no que você realmente tem. Ex: "Consigo dedicar cerca de 5 horas por semana no início."',
  },
  {
    id: 'ap6',
    number: 6,
    text: 'A comunidade vai ser gratuita, paga ou terá um período gratuito antes de monetizar?',
    support: 'Essa decisão impacta diretamente a estratégia de lançamento, o perfil dos primeiros membros e o ritmo de crescimento. Ex: "Vai ser paga desde o início, com um desconto especial para os primeiros membros" ou "Vou começar gratuita por 3 meses para construir a base."',
  },
  {
    id: 'ap7',
    number: 7,
    text: 'Quantos membros você quer ter nos primeiros 90 dias?',
    support: 'Defina uma meta realista, não ideal. Considere sua audiência atual, seu tempo disponível e o modelo de entrada da comunidade. Essa meta vai orientar as prioridades do seu plano. Ex: "Quero chegar a 50 membros nos primeiros 90 dias."',
  },
]

export const ALL_QUESTION_IDS: string[] = PILARES.flatMap((p) =>
  p.etapas.flatMap((e) => e.questions.map((q) => q.id))
)

export const TOTAL_QUESTIONS = ALL_QUESTION_IDS.length // 30

export const ALL_IDS_COMBINED: string[] = [
  ...ALL_QUESTION_IDS,
  ...ACTION_PLAN_QUESTIONS.map((q) => q.id),
]

export const TOTAL_COMBINED = ALL_IDS_COMBINED.length // 37
