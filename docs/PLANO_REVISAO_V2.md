# Plano de Revisão — Programas e turmas (V2)

> Baseado em análise dos PNGs + `Alterações com contexto.md` (overrides o SVG onde há conflito).  
> Prioridade: corrigir interações quebradas → completar layouts → DS compliance.

---

## 0. Restrições globais (valem para todos os arquivos)

- **Sem `bg-{color}/10` em wrappers de ícones** — ícone vai direto no fluxo com `text-{token}`, máximo `className="shrink-0"`.
- **SectionHeader corrigido** — o atual `<div className="text-primary">{icon}</div>` não tem tamanho/espaçamento, fica espremido. Usar apenas `<span className="text-primary shrink-0">{icon}</span>` sem wrapper de div.
- **Tipos de programa expandidos** (PNG `Tipo (auto complete)`): Aberto, Custom, Colaboradores, Easy humanidades, Educação Executiva, EMBA, Eventos, Imersão, Internacionais, LLM, MBA Full time → substituir `TIPO_PROGRAMA` atual.
- **Slots expandidos** (PNG `Detalhes das sessões - Slot`): M1, M2, M3, I1, T1, T2, T3, N1, N2 → substituir `SLOTS` atual.

---

## 1. Programs.tsx

### 1a. ProgramCard — visão lista
- `viewMode === "list"` está no state mas nunca usado no render.
- Adicionar renderização condicional: grid card (atual) vs. linha de tabela.
- **Linha de lista** (baseado nos PNGs `visão 2`): `[sigla] [nome programa] [cliente] [tipo badge] [status badge] [X turmas] [período] [ações ...]`

### 1b. TurmaCard — dados faltantes + visão lista
- Card atual mostra: sigla, nome, programa, modalidade, local, período, diretor.
- **PNGs mostram também**: cliente/empresa, tipo (badge muted), nº de sessões, nº de participantes, status da turma com badge correto.
- `turmaStatusConfig.awaiting_approval.label` ainda diz "Aguardando Aprovação" — mudar para "Em aprovação".
- Adicionar renderização em lista (`viewMode === "list"`): linha com sigla, nome, programa, status, período, diretor, ações.
- Também mostra uma barra de progresso no fim do card com um progresso pra Alocação de recursos. (rever imagem e comportamento e atualizar no protótipo com o comportamento certo)

### 1c. TurmaDetailDrawer (novo componente)
- Clicar em `TurmaCard` deve abrir drawer lateral (similar ao `ProgramDetailDrawer` existente).
- Conteúdo: header com sigla + nome + status badge, seções: Responsáveis (Diretor, DA, Coordenador, Planejamento), Estrutura (Modalidade, Local, Tipo, Período, N° participantes), Sessões (lista resumida), botões: "Editar" + "Abrir cPanel".
- Navegação cPanel: `navigate("/programs/cpanel", { state: { turmaName, programName, siglaTurma } })`.

### 1d. ProgramModal — DS fixes
- `validate()` ainda exige `instituto` (linha ~755) — remover essa validação (alinhado com alterações.md pt 10).
- `"Responsável pelo programa"` label ainda aparece no modal inline — alinhar com NewProgramPage (renomear para "Diretor(a) do programa").
- `SectionHeader` com ícone: corrigir wrapper conforme §0.

### 1e. SectionHeader — ícone hardcoded
- O padrão atual `<div className="text-primary">{icon}</div>` não tem dimensão → ícone sem padding/margem fica grudado no texto.
- Corrigir para `<span className="text-primary shrink-0">{icon}</span>` (sem div, sem gap extra).

---

## 2. NewProgramPage.tsx

### 2a. Seção obrigatória
- O `validate()` foi corrigido mas o bloco de seção ainda tem o título "Informações do programa" sem o separador visual correto de "obrigatórias".
- `SectionHeader` aqui usa `<BookOpen className="w-3.5 h-3.5" />` que agora renderiza sem wrapper — verificar que há espaço adequado.

### 2b. Campo Instituto — duplicado
- Instituto aparece duas vezes (uma no bloco obrigatório original que não foi removido corretamente, outra no bloco opcional que foi adicionado). Verificar linhas e garantir que só existe no bloco opcional.

### 2c. Tipos de programa
- Substituir `TIPO_PROGRAMA` local pelo enum expandido (§0).

---

## 3. NewTurmaPage.tsx

### 3a. Layout geral
- Passos 1–4: continuar com `max-w-2xl mx-auto` centrado.
- **Passos 5 e 6**: layout full-width (sem max-w), pois os designs mostram painel split em tela inteira.
- Botão "**Clonar template**" no canto superior direito do header (abre modal `ClonarTemplateModal`).

### 3b. StepGrade (passo 4) — reescrever
O placeholder atual mostra slots genéricos. O design mostra um **gerenciador de disciplinas/módulos**:
- Input "Digite o módulo" + lista de módulos cadastrados com edit/delete e `+` (para adicionar sessões).
- Clicar em `+` de uma disciplina abre `ModalDisciplina`:
  - Campos: Professor(a), Modalidade (Presencial / Online — sem Híbrido per PNG), Número de sessões, Módulo (texto livre).
  - Botões: Cancelar | Confirmar alterações.
- Módulos são editáveis inline (pencil icon).
- Modal "Módulo" (PNG `Grade - Modal Módulo`): input de busca + lista com edit/delete.

### 3c. StepDetalhes (passo 5) — reescrever
Layout full-width. O placeholder atual é um accordion simplificado; o design mostra:
- **Header da seção**: ícone (sem bg wrapper) + "Sessões e dias de aula" / "Estruture o conteúdo de cada sessão/atividade".
- **Banner rascunho** (já existe mas precisa ser sem `bg-{color}/10` no ícone).
- **Lista de disciplinas** colapsável:
  - **Collapsed**: `▶ Nome disciplina` | `X/Y sessões completas | Presencial | Prof(a) Ana Paula | Módulo (se houver)` | ícone external link.
  - **Expanded**: linhas de sessão com `[Slot dropdown] [Nome sessão input] [status: "Descrições não adicionadas"(destructive) ou "Descrições adicionadas"(success)] [Presencial badge] [Prof name] [edit icon] [remove icon]`.
- Clicar em edit icon de sessão abre **ModalSessao** (3 abas):
  - **Informações**: Tema da sessão, Objetivos pedagógicos (textarea), Professor(a), "Sessão dependente de outra?" / "Sessão dependente (se houver)", Modalidade, Duração, Recurso acadêmico + Quantidade, "+ Adicionar novo recurso".
  - **Materiais**: "+ Adicionar material do Moodle" + cards de material com ícone, nome, tipo, descrição, objetivo, badge Moodle, edit/delete.
  - **Logística**: view-only com edit pencil: Requisição Acadêmica, Local de Refeição, Evento Associado, Necessidades Especiais, Observações Operacionais.
  - Footer: Cancelar | Confirmar.

### 3d. StepDiasAula (passo 6) — reescrever
Layout full-width, dois painéis lado a lado:

**Painel esquerdo** (fixo, ~220px):
- Header: nome da turma + `X/Y atividades agendadas` + barra de progresso.
- Seções colapsáveis: "Atividades acadêmicas (N)" e "Atividades não acadêmicas (N)".
- Dentro de acadêmicas: sub-grupos por disciplina (colapsável).
- **Card de sessão não alocada**: drag handle (`≡`) + nome sessão + slot `M(X)` + duração `75min` + tag módulo.
- Sessões já alocadas somem do painel esquerdo (ficam só no calendário).
- Quando todas alocadas: texto "Não há mais atividades para serem alocadas".

**Painel direito** (flex-1):
- Seletor de intervalo de datas (dropdown `22/03/2027 – 28/03/2027 ▼`).
- Cabeçalho com mês/ano + colunas dos dias (Seg 22, Ter 23, Qua 24...).
- Linhas de horário: 7:00 a 16:00+ com altura fixa por hora.
- Drop zone por célula (dia × horário).
- **Sessão alocada no calendário**: card com nome, professor, sala (`Sala —` se não definida), slot `M(X)`, badges "Recursos adicionados" e "Nome do módulo".
- Clicar na sessão no calendário abre **ModalSessao** (mesma do passo 5 porém com campos extras de Dias de aula: Data e hora, Slot, Selecionar sala/recurso, Solicitar pré-reserva de sala?, Enviar convite no Outlook para professor?).
- **Alt. contexto Pt 1**: Toggle "Horizontal / Vertical" para inverter eixos (recursos nas linhas, dias nas colunas = padrão Outlook-style).
- **Alt. contexto Pt 4**: snap/dominó — ao arrastar sessão, encosta na anterior sem buracos.

**Footer passo 6**: Descartar | Salvar como Rascunho | **Solicitar aprovação** (primary).

### 3e. ClonarTemplateModal (novo)
Baseado em `Container-1.png`:
- Título "Criar a partir de..." + subtítulo.
- Abas: "Clonar Turma Anterior" | "Template Institucional".
- Search input.
- Lista de turmas/templates com radio select + metadados (N disciplinas, N atividades, N turmas, ano).
- Checkboxes por item de clone: Informações do programa, Turmas, Grade Acadêmica, Agrupamento de Atividades.
- Footer: "Clonar estrutura selecionada" (outline, disabled se nada selecionado) | "Começar do zero" (primary).

### 3f. Tipos de programa + Slots
- Aplicar listas expandidas de `TIPO_PROGRAMA` e `SLOTS` do §0.

---

## 4. TurmaCPanelPage.tsx

### 4a. Ícones com bg colorido — remover
- Header: `<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">` em volta de `ClipboardList` → remover wrapper.
- `summaryStats` array: `color: "text-primary bg-primary/10"` etc. → separar em `textColor` e remover o bg. Cards de stat ficam sem ícone colorido-background; ícone fica com `text-{color}` direto.

### 4b. Entry point
- Garantir que a rota `/programs/cpanel` está cadastrada no `App.tsx`.
- `TurmaDetailDrawer` (novo, §1c) deve ter botão "Abrir cPanel" que navega para essa rota.

---

## 5. App.tsx / roteamento

- Verificar se `/programs/cpanel` tem rota para `TurmaCPanelPage`.
- Verificar se `Nova Turma` na Programs.tsx navega via `navigate("/programs/new-turma", { state: { programs } })` (e não abre modal inline).

---

## Fora do escopo desta rodada

- Funcionalidade de drag-and-drop real (interação de arrastar sessão para o calendário) — placeholder visual de drop zones é suficiente.
- Integração com react-big-calendar — layout custom com CSS Grid cobre o design.
- SSO Microsoft (Alt. contexto Pt 12) — fora do escopo.
- Heatmap de ocupação mensal (Alt. contexto Pt 7/14) — fora do escopo.
- Exportação de relatórios (Alt. contexto Pt 9) — fora do escopo.
