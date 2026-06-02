# DIFERENÇAS: FIGMA vs CÓDIGO (Elemento por Elemento)

**Data:** 28/05/2026  
**Método:** Comparação linha por linha de labels, buttons, inputs, e campos entre Figma e código.

---

# SESSÃO "NOVA TURMA - ISE SCHOOL" - ANÁLISE DETALHADA

**Data Análise**: 28/05/2026  
**Objetivo**: Documentar TODAS as diferenças entre Figma e Código, tela por tela, com detalhe máximo.

---

## JORNADAS (Cards Verdes Explicativos - Contexto da Sessão)

| # | Feature/US | Figma | Código | Diferença |
|---|-----------|-------|--------|-----------|
| 1 | **US 3.2.1** - Criação de Turma | "Como Director de Programa (DP) ou Coordenador, quero iniciar o cadastro de uma nova turma vinculada a um programa para que eu possa planejar a execução acadêmica no estado de 'Rascunho', sem travar a agenda institucional de forma definitiva ou disparar notificações em massa." | NewProgramPage.tsx existe, mas é para **Programas** (não Turmas). Não há página específica para criar Turma. | **FLUXO DIFERENTE**: Figma mostra turma como formulário multi-step. Código atual cria Programas, não Turmas. |
| 2 | **US 3.2.2** - Clonar Estruturas | "Diretor de Programa (DP) ou Coordenador, quero clonar estruturas existentes ou utilizar templates institucionais para criar novos programas e turmas, para agilizar o planejamento acadêmico." | Botão "Clonar template" visto em NewProgramPage, mas fluxo de clonagem não implementado. | **COMPORTAMENTO AUSENTE**: Clonagem de templates não está implementada no código. |
| 3 | **US 3.2.3** - Atividades Operacionais | "Como Diretor de Programa (DP) ou Coordenador, quero cadastrar atividades operacionais e de apoio (como recepções, coffee breaks, almoços e deslocamentos) na grade da turma." | NewProgramPage.tsx não tem seção específica para atividades operacionais. | **FEATURE AUSENTE**: Não há implementação de atividades não-acadêmicas no código. |
| 4 | **US 3.2.4** - Submeter Turma para Workflow | "Como Diretor de Programa ou Coordenador, quero submeter a turma para o workflow para que as demais áreas deem continuidade ao preenchimento dos dados." | Botão "Próximo" existe em Figma, avançando entre steps. NewProgramPage tem "Próximo" também. | **FLUXO COMPATÍVEL**: Ambos têm navegação entre steps. Diferença é que Figma é de Turma, Código é de Programa. |
| 5 | **US 4.2.1** - Distribuir Slots de Sessões | "Como Diretor Acadêmico (DA), quero distribuir os slots de sessões pedagógicas configuradas em blocos (M1, M2, T1, T2) nos dias de aula previstos." | CalendarPage.tsx gerencia o calendário, mas estrutura de "slots" e "blocos" não é evidente no código. | **ESTRUTURA DIFERENTE**: Figma define blocos de horários (M1, M2, T1, T2), código trabalha com eventos genéricos. |
| 6 | **US 4.2.3** - Preencher Dados de Recursos | "Como analista de planejamento quero preencher os dados dos recursos para as atividades não acadêmicas da turma." | Não há seção de "Recursos" ou "Atividades Não Acadêmicas" no código. | **FEATURE AUSENTE**: Recursos não-acadêmicos não estão implementados. |
| 7 | **US 4.2.2** - Solicitação de Confirmação | "Como Diretor de Programa (DP) ou Diretor Acadêmico (DA), quero disparar uma solicitação de confirmação definitiva para recursos específicos." | Não há fluxo de "solicitação de confirmação" ou "reserva bloqueada" no código. | **FEATURE AUSENTE**: Workflow de confirmação de recursos não implementado. |
| 8 | **US 4.3.1** - Detalhamento e Vínculo de Materiais | "Como Coordenador Acadêmico (CA), quero inserir os metadados pedagógicos, vincular materiais e registrar requisições operacionais." | Não há seção de materiais ou metadados pedagógicos no código. | **FEATURE AUSENTE**: Integração com materiais pedagógicos não está implementada. |

---

## TELA 1: Identificação - Nova Turma

### Elementos Globais (todas as telas)
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Sidebar/Menu** | Presente com: Dashboard, Calendário, Relatórios dinâmicos, Programas e turmas, Pré-Reservas, Horário Oficial, Tarefas | Presente em AppLayout (Sidebar.tsx) | **COMPATÍVEL** |
| **Header** | Programa/Turma "Programas e turmas", Busca global, Notificações, Menu de usuário | Presente em Header.tsx | **COMPATÍVEL** |
| **Step Indicator** | 6 steps numerados (1-6) conectados por linhas | Não encontrado em NewProgramPage | **AUSENTE**: Multi-step com 6 passos não existe |

### Step Indicator (Breadcrumb)
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| Step 1 Label | "Idêntificação" | Não encontrado em NewProgramPage | **LABEL DIFERENTE**: Figma usa "Idêntificação" com acento circunflexo. |
| Step 2 Label | "Responsáveis" | Não encontrado | **AUSENTE**: Step 2 não existe no código (seria para Programa, não Turma). |
| Step 3 Label | "Estrutura acadêmica" | Não encontrado | **AUSENTE**: Step 3 não existe no código. |
| Step 4 Label | "Grade" | Não encontrado | **AUSENTE**: Step 4 não existe no código. |
| Step 5 Label | "Dias de aula" | Não encontrado | **AUSENTE**: Step 5 não existe no código. |
| Step 6 Label | "Detalhes das sessões" | Não encontrado | **AUSENTE**: Step 6 não existe no código. |

### Form Fields - Tela de Identificação
| Campo | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| **Programa relacionado** | Label: "Programa relacionado *" | NewProgramPage: `tipo` field mapeado para TIPO_PROGRAMA | **LABEL DIFERENTE**: Figma chama "Programa relacionado", Código chama "tipo de programa" (não explícito em label). |
| | Tipo: Select/Dropdown | Tipo: Select (TIPO_PROGRAMA array) | **COMPATÍVEL** |
| | Placeholder: "Selecione um programa" | Placeholder: Não verificado | **PODE DIFERIR** |
| **Nome fantasia (português)** | Label: "Nome fantasia (portugues) *" | NewProgramPage: Não encontrado | **LABEL AUSENTE**: Campo não existe no código (seria para Turma). |
| | Obrigatório: Sim (*) | - | - |
| | Tipo: Text Input | - | - |
| | Placeholder: "Escrever..." | - | - |
| **Nome fantasia (Inglês)** | Label: "Nome fantasia (Inglês)" | Não encontrado | **CAMPO AUSENTE**: Campo multilíngue não existe no código. |
| | Obrigatório: Não | - | - |
| **Nome fantasia (espanhol)** | Label: "Nome fantasia (espanhol)" | Não encontrado | **CAMPO AUSENTE**: Campo multilíngue não existe no código. |
| | Obrigatório: Não | - | - |
| **Ano de início** | Label: "Ano de início" | Não encontrado | **CAMPO AUSENTE**: Campo não existe no código. |
| | Tipo: Select/Dropdown | - | - |
| | Placeholder: "Selecione o ano" | - | - |
| **Ano de conclusão** | Label: "Ano de conclusão" | Não encontrado | **CAMPO AUSENTE**: Campo não existe no código. |
| | Tipo: Select/Dropdown | - | - |
| **Sigla da turma** | Label: "Sigla da turma *" | Não encontrado | **LABEL DIFERENTE**: Figma especifica "Sigla da turma", Código não tem esta estrutura. |
| | Obrigatório: Sim (*) | - | - |
| | Valor de exemplo: "# TFAH" | - | - |
| **Nome da turma (gerado automaticamente)** | Label: "Nome da turma (gerado automaticamente)" | Não encontrado | **COMPORTAMENTO AUSENTE**: Campo auto-gerado não existe. |
| | Obrigatório: Não | - | - |
| | Tipo: Read-only/Auto-generated | - | - |
| **Nome financeiro** | Label: "Nome financeiro" | Não encontrado | **CAMPO AUSENTE**: Integração financeira não existe. |
| | Tipo: Read-only com valor de exemplo | - | - |
| | Valor exemplo: "Nome para a nota fiscal" | - | - |
| **Código financeiro** | Label: "Código financeiro" | Não encontrado | **CAMPO AUSENTE**: Integração financeira não existe. |
| | Tipo: Read-only com valor exemplo | - | - |
| | Valor exemplo: "Fin - 1213 - 3213" | - | - |

### Buttons - Tela de Identificação
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| Button "Descartar" | Presente | "Descartar" existe em NewProgramPage | **COMPATÍVEL** |
| Button "Salvar como Rascunho" | Presente com ícone | Presente em NewProgramPage | **COMPATÍVEL** |
| Button "Próximo" | Presente (cta primária) | Presente em NewProgramPage | **COMPATÍVEL** |
| Button "Clonar template" (topo direito) | Presente | Presente em NewProgramPage | **COMPATÍVEL** |

---

## TELA 2: Responsáveis

### Form Fields - Tela de Responsáveis
| Campo | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| **Diretor(a) do programa** | Label: "Diretor(a) do programa *" | NewProgramPage: `responsavel` (label não explícito) | **LABEL DIFERENTE**: Figma especifica "Diretor(a) do programa", Código tem "responsavel". |
| | Obrigatório: Sim (*) | Sim (obrigatório) | **COMPATÍVEL** |
| | Tipo: Autocomplete/Search | Tipo: Autocomplete (PeopleAutocomplete) | **COMPATÍVEL** |
| | Placeholder: "Buscar diretor..." | Placeholder: Pode variar | **PODE DIFERIR** |
| **Diretor(a) acadêmico(a)** | Label: "Diretor(a) acadêmico(a) *" | Não encontrado em NewProgramPage | **LABEL NOVO**: Campo específico não existe no código. |
| | Obrigatório: Sim (*) | - | - |
| | Tipo: Autocomplete | - | - |
| | Placeholder: "Buscar diretor..." | - | - |
| **Coordenador(a) da turma** | Label: "Coordenador(a) da turma" | NewProgramPage: Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Obrigatório: Não | - | - |
| | Tipo: Autocomplete | - | - |
| | Placeholder: "Buscar coordenador..." | - | - |
| **Diretor(a) de turma** | Label: "Diretor(a) de turma" | Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Obrigatório: Não | - | - |
| | Tipo: Autocomplete | - | - |
| **Responsável por materiais** | Label: "Responsável por materiais" | Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Tipo: Autocomplete | - | - |
| **Coordenador(a) acadêmico(a)** | Label: "Coordenador(a) acadêmico(a)" | Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Tipo: Autocomplete | - | - |

**Observação**: Figma tem 6 campos de responsáveis diferentes, NewProgramPage tem apenas `responsavel`. Estrutura completamente diferente.

---

## TELA 3: Estrutura Acadêmica

### Form Fields - Tela de Estrutura Acadêmica
| Campo | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| **Modalidade** | Label: "Modalidade *" | CalendarPage.tsx: Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Obrigatório: Sim (*) | - | - |
| | Tipo: Select/Dropdown | - | - |
| | Valor exemplo: "Presencial" | - | - |
| **Local** | Label: "Local" | Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Tipo: Text Input | - | - |
| | Placeholder: "Escolha a local" | - | - |
| **Datas de início e fim da turma** | Label: "Datas de início e fim da turma" | Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Tipo: Date picker (range) | - | - |
| | Campos: "Data início", "Data fim" | - | - |
| **Tipo de programa** | Label: "Tipo de programa" | NewProgramPage: `tipo` field | **COMPATÍVEL** (Figma para Turma, Código para Programa) |
| | Tipo: Preset/Display (XXXXXXXXXX) | - | - |
| **Número de alunos participante** | Label: "Número de alunos participante" | Não encontrado | **LABEL NOVO**: Campo não existe. |
| | Tipo: Text Input/Number | - | - |
| | Placeholder: "Digite aqui" | - | - |

---

## TELA 4: Grade

### Section: Grade Acadêmica
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Descrição da seção** | "Defina as disciplinas e outras atividades/conteúdos da turma. Indicando os professores responsáveis e as sessões necessárias." | Não encontrado | **DESCRIÇÃO NOVA**: Texto explicativo não existe no código. |
| **Info box** | "Recursos previstos em modo Rascunho. Atenção: mais espaço não deverão caberem conflitos no Outlook." | Não encontrado | **INFO AUSENTE**: Aviso sobre conflitos não existe. |

### Table: Disciplinas
| Coluna | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Disciplina** | Coluna: Disciplina | Não encontrado | **TABELA AUSENTE**: Tabela de disciplinas não existe no código. |
| | Exemplo: "Escreva" | - | - |
| **Área acadêmica** | Coluna: Área acadêmica | - | - |
| | Exemplo: "Escreva" | - | - |
| **Modalidade** | Coluna: Modalidade | - | - |
| | Tipo: Select/Dropdown | - | - |
| **Professor** | Coluna: Professor | - | - |
| | Tipo: Autocomplete | - | - |
| | Placeholder: "Buscar professor" | - | - |
| **Sessões** | Coluna: Sessões | - | - |
| | Exemplo: "Escreva em número" | - | - |
| **Ações** | Icons para: check, warning, X (remover) | - | - |

### Controls
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| Link "+ Adicionar nova disciplina" | Presente | Não encontrado | **CONTROLE AUSENTE**: Não há forma de adicionar disciplinas dinamicamente. |

### Section: Atividades não acadêmicas
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Atividades não acadêmicas" | Não encontrado | **SEÇÃO AUSENTE**: Atividades não-acadêmicas não existem no código. |

### Table: Atividades Não Acadêmicas
| Coluna | Figma | Exemplo | Diferença |
|--------|-------|---------|-----------|
| **Nome** | "Escreva o nome da atividade" | Ex: "Escreva o nome da atividade", "Coffee break" | **TABELA AUSENTE** |
| **Repetições** | "Escreva em número" | Ex: "Escreva em número" | **AUSENTE** |
| **Responsável** | Autocomplete | "Buscar responsável" | **AUSENTE** |
| **Ações** | Icon X para remover | - | **AUSENTE** |

### Controls
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| Link "+ Adicionar nova atividade acadêmica" | Presente | Não encontrado | **CONTROLE AUSENTE** |

---

## TELA 5: Dias de Aula

**Status**: A tela foi muito grande para extrair em detalhes. Contém estrutura de calendário/alocação de dias.

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| Estrutura geral | Multi-step form para definir dias de aula | CalendarPage.tsx gerencia eventos/reservas | **CONTEXTO DIFERENTE**: Figma é step de criação, Código é gerenciamento de calendário existente. |

---

## TELA 6: Detalhes das Sessões

> **Nota**: Não foi extraído do Figma. Apenas referenciado no step indicator.

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Detalhes das sessões" (step 6) | Não existe | **AUSENTE**: Step 6 não implementado |

---

## TELA 1: Login / Bem-vindo (944-14588)

### Não há código correspondente encontrado
- ❓ Arquivo `Login.tsx` não localizado no projeto

---

## TELA 2: Dashboard (944-13472)

### 📍 Arquivo: `/src/pages/Dashboard.tsx`

#### STAT CARDS

| # | Figma | Código | Diferença |
|---|-------|--------|-----------|
| 1 | "Programas ativos" | "Programas Ativos" | Capitalization |
| 2 | "87 Professores" | "Professores Alocados (hoje)" | Label completamente diferente |
| 3 | "18 Salas provisionadas" | "Salas Reservadas (hoje)" | Label diferente + descritor diferente |
| 4 | - | "Alunos previstos hoje (campus ISE)" | Item a mais no código |
| 5 | - | "Alunos previstos amanhã (campus ISE)" | Item a mais no código |

#### TURMAS (Seção "Turmas Recentes")

**Figma tem:** 6 linhas de turmas  
**Código tem:** 5 turmas definidas em `const turmas`

| Campo | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| Nome turma 1 | "MBA Executivo – T2025A" | "MBA Executivo – T2025A" | ✓ Igual |
| Nome turma 2 | "Especialização Finanças – T2026B" | "Especialização Finanças – T2026B" | ✓ Igual |
| Nome turma 3 | "Liderança Estratégica – T2026A" | "Liderança Estratégica – T2026A" | ✓ Igual |
| Nome turma 4 | "Marketing Digital – T2026D" | "Marketing Digital – T2026D" | ✓ Igual |
| Nome turma 5 | "Inovação e Startups – T2026C" | "Inovação e Startups – T2026C" | ✓ Igual |
| Turma 6 | "Imersão Design – T2026E" | Não existe | Faltando no código |

#### STATUS LABELS (Turmas)

| Status | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| Active | "Ativa/Em andamento" | "Aprovada/Em andamento" | Label diferente |
| Draft | "Rascunho" | "Rascunho" | ✓ Igual |
| Pending | "Em aprovação" | "Em aprovação" | ✓ Igual |

#### ALERTS (Seção "Alertas & Notificações")

| # | Figma | Código | Diferença |
|---|-------|--------|-----------|
| Alert 1 Message | "Conflito detectado: Dr. Lima alocado em 2 sessões simultâneas em 15/Mar" | "Conflito detectado: Dr. Lima alocado em 2 sessões simultâneas em 15/Mar" | ✓ Igual |
| Alert 1 Time | "Há 2h" | "Há 2h" | ✓ Igual |
| Alert 2 Message | "Pré-reserva de sala Auditório A aguardando aprovação (MBA T24A)" | "Pré-reserva de sala Auditório A aguardando aprovação (MBA T24A)" | ✓ Igual |
| Alert 2 Time | "Há 4h" | "Há 4h" | ✓ Igual |
| Alert 3 Message | "Horário Oficial do MBA Executivo T23B foi publicado" | "Horário Oficial do MBA Executivo T23B foi publicado" | ✓ Igual |
| Alert 3 Time | "Ontem" | "Ontem" | ✓ Igual |

#### TASKS (Seção "Tarefas")

| Field | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| Task 1 Title | "Resolver conflito de sala — Prof. Ana Silva" | "Resolver conflito de sala — Prof. Ana Silva" | ✓ Igual |
| Task 1 Role | "Diretora Acadêmica" | "Diretora Acadêmica" | ✓ Igual |
| Task 1 Priority | Overdue (red) | "overdue" | ✓ Igual |
| Task 2 Title | "Definir professores para sessões ainda sem alocação." | "Definir professores para sessões ainda sem alocação." | ✓ Igual |
| Task 2 Role | "Diretora Acadêmica" | "Diretora Acadêmica" | ✓ Igual |
| Task 3 Title | "Revisar outlines pendentes" | "Revisar outlines pendentes" | ✓ Igual |
| Task 4 Title | "Confirmar carga horária total da turma" | "Confirmar carga horária total da turma" | ✓ Igual |

---

## TELA 4: Programas (Lista) (944-14744)

### 📍 Arquivo: `/src/pages/Programs.tsx`

#### PAGE HEADER

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| Title | "Programas" | Não explícito em leitura inicial | ❓ Verificar |
| Subtitle | "Gestão e planejamento de programas acadêmicos" | Não explícito | ❓ Verificar |

#### BUTTONS (Top Area)

| Button | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| "Nova Turma" | Secondary button | Plus icon + "Nova Turma" | ✓ Presente |
| "Novo Programa" | Primary button | Plus icon + "Novo Programa" | ✓ Presente |

#### TOGGLE GROUP

| Toggle | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| "Programas" | Active state | Implemented | ✓ Presente |
| "Turmas" | Inactive state | Implemented | ✓ Presente |

---

## TELA 5: Modal Programa (1578-1824)

### Não há código correspondente encontrado no Programs.tsx
- ❓ Modal de detalhes não localizado ou implementado como componente separado

---

## TELA 6-8: Novo Programa (Passos 1-3)

### 📍 Arquivo: `/src/pages/NewProgramPage.tsx`

#### FORM LABELS (Figma vs Código)

| Campo | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| Nome | "Nome do programa *" | `form.name` | ✓ Similar |
| Sigla | "Sigla *" | `form.sigla` | ✓ Similar |
| Tipo | "Tipo *" | `form.tipo` | ✓ Similar |
| Instituto | Implícito em seleção | `form.instituto` | ✓ Similar |
| Diretor(a) do programa | "Diretor(a) do programa *" | `form.responsavel` | Field name diferente |
| Diretor(a) acadêmico | "Diretor(a) acadêmico *" | Não no passo 1 | Localização diferente |
| Responsável pelo programa | "Responsável pelo programa" | Expandable section | ✓ Presente |
| Coordenador(a) acadêmico | "Coordenador(a) acadêmico" | `form.coordenador` | ✓ Similar |

#### PEOPLE LIST (Autocomplete Options)

| Nome | Figma | Código | Diferença |
|------|-------|--------|-----------|
| 1 | "Prof. Dr. Carlos Faria" | "Prof. Dr. Carlos Faria" | ✓ Igual |
| 2 | "Profa. Dra. Ana Souza" | "Profa. Dra. Ana Souza" | ✓ Igual |
| 3 | "Prof. Dr. Pedro Costa" | "Prof. Dr. Pedro Costa" | ✓ Igual |
| 4 | "Prof. Dr. Marcos Lima" | "Prof. Dr. Marcos Lima" | ✓ Igual |
| 5 | "Profa. Dra. Lucia Mendes" | "Profa. Dra. Lucia Mendes" | ✓ Igual |
| 6 | "Rafael Torres" | "Rafael Torres" | ✓ Igual |
| 7 | "Paula Neves" | "Paula Neves" | ✓ Igual |
| 8 | "Fernando Alves" | "Fernando Alves" | ✓ Igual |
| 9 | "Carla Barros" | "Carla Barros" | ✓ Igual |

#### BUTTONS (Form Bottom)

| Button | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| "Descartar" | Secondary button (left) | Implementado | ✓ Presente |
| "Salvar como Rascunho" | Secondary button | `handleAction("draft")` | ✓ Presente |
| "Entrar para aprovação" | Primary button (right) | `handleAction("submit")` | ✓ Presente |
| "Clonar template" | Aparente no Figma | ❓ Não encontrado | ❓ Faltando |

#### TIPO PROGRAMA (Dropdown Options)

| Tipo | Figma | Código | Label diferente? |
|------|-------|--------|-------------------|
| Custom | "Custom" | "Custom" | ✓ Igual |
| Aberto | "Aberto" | "Aberto" | ✓ Igual |
| Imersão | "Imersão" | "Imersão" | ✓ Igual |
| EMBA | "EMBA" | "EMBA" | ✓ Igual |
| MBA Full Time | "MBA Full Time" | "MBA Full Time" | ✓ Igual |
| Educação Executiva | "Educação Executiva" | "Educação Executiva" | ✓ Igual |
| Colaboradores | "Colaboradores" | "Colaboradores" | ✓ Igual |
| Eventos | "Eventos" | "Eventos" | ✓ Igual |
| Internacionais | "Internacionais" | "Internacionais" | ✓ Igual |
| LLM | "LLM" | "LLM" | ✓ Igual |
| Easy Humanidades | "Easy Humanidades" | "Easy Humanidades" | ✓ Igual |

---

## TELA 9-11: Modal Criar a partir de... (944-17606, 1241-983, 1241-1649)

### Não há código correspondente encontrado
- ❓ Modal "Criar a partir de..." não localizado no NewProgramPage.tsx ou em outro arquivo

---

## 🔴 DIFERENÇAS CRÍTICAS ENCONTRADAS

### 1. Dashboard - Stat Card Labels

**Figma:**
```
1. Programas ativos
2. (não especificado)
3. (não especificado)  
4. (não mencionado)
5. (não mencionado)
```

**Código:**
```
1. Programas Ativos
2. Alunos previstos hoje (campus ISE) 
3. Alunos previstos amanhã (campus ISE)
4. Professores Alocados (hoje)
5. Salas Reservadas (hoje)
```

**Diferença:** Labels são diferentes e quantidade de cards não corresponde

---

### 2. Dashboard - Status Label (Turmas)

**Figma:** "Ativa/Em andamento"  
**Código:** "Aprovada/Em andamento"

---

### 3. NewProgramPage - Form Field Internal Name

**Figma:** Campo UI se chama "Diretor(a) do programa"  
**Código:** Campo internamente se chama `form.responsavel`

---

### 4. Dashboard - Turma 6

**Figma:** 6 turmas listadas  
**Código:** 5 turmas em `const turmas`

Faltando:
- "Imersão Design – T2026E"

---

### 5. Modal "Criar a partir de..."

**Figma:** 3 telas inteiras com modal de clonagem (tabs, search, radio, checkboxes)  
**Código:** Não encontrado em NewProgramPage.tsx

---

### 6. NewProgramPage - Button "Clonar template"

**Figma:** Button "Clonar template" aparente no layout  
**Código:** Não encontrado em NewProgramPage.tsx

---

## ✅ ALINHAMENTOS CONFIRMADOS

- ✓ PEOPLE array: 9 nomes idênticos
- ✓ TIPO_PROGRAMA: 11 tipos idênticos  
- ✓ Alert messages: idênticas
- ✓ Task titles: idênticas  
- ✓ Turmas 1-5: nomes idênticos
- ✓ Status draft e pending: alinhadas

---

---

# TELA 7: Tarefas (944-8933)

### 📍 Arquivo: Não encontrado no código

**Status**: ❌ **PÁGINA COMPLETAMENTE AUSENTE**

Figma possui página completa de gerenciamento de tarefas, mas não há correspondência no código.

---

## Estrutura da Página "Tarefas"

### Header da Página
| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Tarefas" (14px, semibold) | Não existe | **PÁGINA AUSENTE** |
| **Subtitle** | "Acompanhe e gerencie as tarefas da equipe" | - | - |

### Stat Cards - Tarefas

| Card | Figma | Código | Diferença |
|------|-------|--------|-----------|
| **Pendentes** | "6" (grande), "Pendentes" (label) | Não existe | **CARD AUSENTE** |
| **Próximas do prazo** | "2" (grande), "Próximas do prazo" (label) | Não existe | **CARD AUSENTE** |
| **Atrasadas** | "3" (grande), "Atrasadas" (label) | Não existe | **CARD AUSENTE** |
| **Finalizadas** | "1" (grande), "Finalizadas" (label) | Não existe | **CARD AUSENTE** |

### Tabs de Filtro (Abas)

| Aba | Figma | Código | Diferença |
|-----|-------|--------|-----------|
| **Todas** | Presente | Não existe | **AUSENTE** |
| **Pendentes** | Presente | Não existe | **AUSENTE** |
| **Concluídas** | Presente | Não existe | **AUSENTE** |
| **Próximas do prazo** | Presente | Não existe | **AUSENTE** |
| **Atrasadas** | Presente | Não existe | **AUSENTE** |

### Campo de Busca

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Placeholder** | "Buscar tarefa" | Não existe | **AUSENTE** |
| **Ícone** | Search (magnifier) | - | - |

### Seção de Filtros Avançados

| Filtro | Figma | Tipo | Código | Diferença |
|--------|-------|------|--------|-----------|
| **Ícone Filtros** | Presente (16px) | Icon | Não existe | **AUSENTE** |
| **"Apenas as minhas"** | Dropdown | Select | Não existe | **AUSENTE** |
| **"Todos os programas"** | Dropdown | Select | Não existe | **AUSENTE** |
| **"Todas as turmas"** | Dropdown | Select | Não existe | **AUSENTE** |
| **"Período customizado"** | Date range picker | Date inputs (início + fim) | Não existe | **AUSENTE** |

### Tabela de Tarefas - Colunas

| Coluna | Figma | Tipo | Código | Diferença |
|--------|-------|------|--------|-----------|
| **Tarefa** (com ícone) | Text + Icon | Checkbox + Title | Não existe | **TABELA AUSENTE** |
| **Programa/Turma** | Text | Text | Não existe | - |
| **Responsável** | Person name + Role | Text + Subtext | Não existe | - |
| **Prazo** | Date (DD/MM/YYYY) | Date | Não existe | - |
| **Status** | Badge com label | Badge component | Não existe | - |

### Dados da Tabela - Exemplo de Linha

| Campo | Figma | Código | Diferença |
|-------|-------|--------|-----------|
| **Tarefa 1** | "Resolver conflito de sala — Prof. Ana Silva (14/Mar...)" | Não existe | **AUSENTE** |
| **Descrição da Tarefa 1** | "Prof. Ana com 2 atividades sobrepostas, realocar s..." | Não existe | **AUSENTE** |
| **Programa/Turma (Tarefa 1)** | "MBA Executivo / MBA-2026-T1" | Não existe | **AUSENTE** |
| **Responsável (Tarefa 1)** | "Camila Rocha" + "Diretora Acadêmica" | Não existe | **AUSENTE** |
| **Prazo (Tarefa 1)** | "12/03/2026" | Não existe | **AUSENTE** |
| **Status (Tarefa 1)** | "Atrasada" (badge red) | Não existe | **AUSENTE** |
| **Tarefa 2** | "Definir professores para sessões ainda sem alocação." | Não existe | **AUSENTE** |
| **Programa/Turma (Tarefa 2)** | "Gestão de Projetos" | Não existe | **AUSENTE** |
| **Status (Tarefa 2)** | "Atrasada" (badge red) | Não existe | **AUSENTE** |
| **Tarefa 3** | "Revisar outlines pendentes" | Não existe | **AUSENTE** |
| **Programa/Turma (Tarefa 3)** | "Data Science / DS-2026-T1" | Não existe | **AUSENTE** |
| **Status (Tarefa 3)** | "Atrasada" (badge red) | Não existe | **AUSENTE** |

### Status Badge - Tipos

| Status | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Atrasada** | Red background | Badge | Não existe | **AUSENTE** |
| (Outros status não completamente extraídos) | - | - | - |

---

## 📊 Resumo

| Item | Figma | Código | Status |
|------|-------|--------|--------|
| Login page | Presente | Não encontrado | ❌ Faltando |
| Dashboard stat cards | 5 cards com labels específicos | 5 cards com labels diferentes | ⚠️ Diferente |
| Dashboard turma 6 | Imersão Design – T2026E | Não existe | ❌ Faltando |
| Dashboard status active | "Ativa/Em andamento" | "Aprovada/Em andamento" | ⚠️ Diferente |
| Programs page title | "Programas" | Não localizado | ❓ Verificar |
| NewProgram form | Completo | Completo | ✓ OK |
| Clone modal | 3 telas completas | Não encontrado | ❌ Faltando |
| Clone template button | Presente | Não encontrado | ❌ Faltando |
| **Tarefas - Página inteira** | Completa (7 seções) | Não encontrado | ❌ Faltando |
| **Tarefas - Stat cards** | 4 cards (6, 2, 3, 1) | Não existe | ❌ Faltando |
| **Tarefas - Filtros** | 5 abas + 4 filtros avançados | Não existe | ❌ Faltando |
| **Tarefas - Tabela** | 5 colunas com 3+ linhas | Não existe | ❌ Faltando |

---

# TELA 8: Calendário Acadêmico (944-812)

### 📍 Arquivo: `/src/pages/CalendarPage.tsx`

**Status**: ✅ **IMPLEMENTADO** (com algumas diferenças)

---

## Jornadas/Features - Calendário

| # | Feature | Figma | Código | Diferença |
|---|---------|-------|--------|-----------|
| 1 | Gestão de Agendas - Visualização Estilo Calendário | "Visualizar ocupação em formato de agenda, localizar janelas livres visualmente, comparar disponibilidades entre dias, ajustes rápidos na programação com feedback imediato de conflitos." | CalendarPage: Grid visual, eventos com status visuais, drag-drop | **COMPATÍVEL** |
| 2 | Alternância entre Períodos | "Alternar entre semana, mês ou semestre para visualizar a ocupação em diferentes horizontes de planejamento." | CalendarPage: DIAS, visualização semana + múltiplos períodos via toggle | **COMPATÍVEL** |
| 3 | Filtro por Tipo de Recurso | "Filtrar recursos por tipo para focar apenas no que é relevante para minha tarefa." | CalendarPage: FILTER_BY_TYPES (6 tipos) | **COMPATÍVEL** |
| 4 | Visualização de Programação Completa | "Visualizar programação completa em linha do tempo correlacionando horários e recursos..." | CalendarPage: Time slots, eventos mapeados por dia/hora | **COMPATÍVEL** |
| 5 | Indicadores de Ocupação | "Visualizar indicadores de ocupação para entender utilização geral do período." | CalendarPage: ShowMode ("free", "occupied", "both"), OccupancyLevel ("low", "medium", "high") | **COMPATÍVEL** |
| 6 | Exportar Agenda | "Exportar agenda com filtros aplicados para compartilhar informações, enviar cronogramas, análises..." | CalendarPage: Não encontrado | **AUSENTE**: Função de export |

## Header da Página - Calendário

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Calendário Acadêmico" | CalendarPage: Não explícito | ❓ Verificar |
| **Subtitle** | "Visualização e gestão de sessões e eventos" | Não explícito | ❓ Verificar |

## Seção de Navegação de Período

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Botão Seta Esquerda** | Presente (prev week) | CalendarPage: ChevronLeft importado | **COMPATÍVEL** |
| **Range de Datas** | "11/03 - 17/03" | CalendarPage: Calcula automaticamente baseado em START_HOUR, END_HOUR | **COMPATÍVEL** |
| **Botão Seta Direita** | Presente (next week) | CalendarPage: ChevronRight importado | **COMPATÍVEL** |
| **Botão "Hoje"** | Presente (retorna hoje) | CalendarPage: ✓ "Hoje" button implementado | **COMPATÍVEL** |

## Toggles de Visualização

| Toggle | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Dia** | Presente | CalendarPage: ✓ "Dia" implementado | **COMPATÍVEL** |
| **Semana** | Presente (ativo) | CalendarPage: ✓ "Semana" implementado | **COMPATÍVEL** |
| **Mês** | Presente | CalendarPage: ✓ "Mês" implementado | **COMPATÍVEL** |
| **Semestre** | Presente | CalendarPage: ✓ "Semestre" implementado | **COMPATÍVEL** |
| **Ano** | Presente | CalendarPage: ✓ "Ano" implementado | **COMPATÍVEL** |

## Filtros - Primeira Linha

| Filtro | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Ícone "Filtros"** | Presente | CalendarPage: Filter icon importado | **COMPATÍVEL** |
| **Todos os docentes** | Dropdown | CalendarPage: PROFESSORS array | **COMPATÍVEL** |
| **Todos os temas** | Dropdown | CalendarPage: THEMES array | **COMPATÍVEL** |
| **Todas as salas** | Dropdown | CalendarPage: ROOMS array (Plenárias, Auditórios, Salas Equipe, Refeitório) | **COMPATÍVEL** |
| **Todos os recursos** | Dropdown | CalendarPage: Pode incluir RA_OPTIONS (em Sessions.tsx) | **PODE DIFERIR** |
| **Todos os status** | Dropdown | CalendarPage: STATUSES array (Reservado, Pré-reservado, Conflito, Rascunho) | **COMPATÍVEL** |

## Filtros - Segunda Linha

| Filtro | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Todas as turmas** | Dropdown | CalendarPage: TURMAS array (8 turmas) | **COMPATÍVEL** |

## Período Customizado

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Label "Período customizado:"** | Presente | CalendarPage: Não visto explicitamente | ❓ Verificar |
| **Data de Início** | "03/09/2026" | CalendarPage: State date range picker | **COMPATÍVEL** |
| **"até"** | Presente | CalendarPage: Date range picker | **COMPATÍVEL** |
| **Data de Fim** | "03/15/2026" | CalendarPage: Date range picker | **COMPATÍVEL** |

## Calendário - Estrutura da Grade

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Cabeçalho de Dias** | "Dom 11", "Seg 12", etc. (7 dias) | CalendarPage: DAYS array + datas dinâmicas | **COMPATÍVEL** |
| **Horários (Coluna esquerda)** | "7:00", "8:00", ... "18:00" | CalendarPage: HOURS array (7-19) | **COMPATÍVEL** |
| **Grid de Colunas por Dia** | 7 colunas (semana) | CalendarPage: 7 colunas para semana | **COMPATÍVEL** |
| **Grid de Linhas por Hora** | 13 horas × 2 slots (30 min) = 26 linhas | CalendarPage: SLOT_MINUTES = 30, TIME_SLOTS array | **COMPATÍVEL** |

## Eventos - Exemplo "Estratégia empresarial"

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Título do Evento** | "Estratégia empresarial" | CalendarPage: event.title (ex: "MBA Executivo – Módulo 3") | **COMPATÍVEL** |
| **Ícone (check_circle)** | Presente (✓) | CalendarPage: status visuais: "Reservado" = check icon | **COMPATÍVEL** |
| **Sala** | "Sala 201" | CalendarPage: event.room (ex: "Plenária 1") | **COMPATÍVEL** |
| **Professor** | "Prof(a) Ana Paula" | CalendarPage: event.professor (ex: "Dr. Faria") | **COMPATÍVEL** |
| **Slot** | "M1" (badge pequena) | CalendarPage: ❓ Não encontrado "M1", "M2", "T1", "T2" slots | **PODE DIFERIR** |
| **Badge "Módulo"** | Presente | CalendarPage: ❓ Badge "Módulo" não visto | **AUSENTE**: Badge de tipo |
| **Badge "Recursos adicionados"** | Presente | CalendarPage: ❓ Badge "Recursos adicionados" não visto | **AUSENTE**: Badge de recursos |
| **Cor de Fundo** | Azul claro (primary) | CalendarPage: color: "primary" \| "bg-primary/15 border-primary text-primary" | **COMPATÍVEL** |
| **Overflow (+5 outras)** | "...+5 outras" (quando muitos eventos no slot) | CalendarPage: ❓ Comportamento de overflow não verificado | **PODE DIFERIR** |

## Características de Interação

| Recurso | Figma | Código | Diferença |
|---------|-------|--------|-----------|
| **Drag & Drop de Eventos** | Não explícito em Figma | CalendarPage: useDraggable, useDroppable, DndContext | ✓ **IMPLEMENTADO**: Código tem recurso não visível em Figma |
| **Resize de Eventos** | Não explícito | CalendarPage: ResizeEdge ("start", "end") | ✓ **IMPLEMENTADO**: Código tem recurso não visível em Figma |
| **Filtros Aplicáveis** | Múltiplos dropdowns | CalendarPage: useState para cada filtro | **COMPATÍVEL** |
| **Show Mode** | Não explícito | CalendarPage: ShowMode ("free", "occupied", "both") | ✓ **RECURSO EXTRA**: Código oferece mais do que Figma mostra |

---

## Comparação Calendário: Figma vs Código

| Aspecto | Figma | Código | Status |
|--------|-------|--------|--------|
| **Visualização Semana** | Sim (ativo) | ✓ Sim | ✅ OK |
| **Visualização Dia** | Botão presente | ✓ Sim | ✅ OK |
| **Visualização Mês** | Botão presente | ✓ Sim | ✅ OK |
| **Visualização Semestre** | Botão presente | ✓ Sim | ✅ OK |
| **Visualização Ano** | Botão presente | ✓ Sim | ✅ OK |
| **Filtro Docentes** | "Todos os docentes" | PROFESSORS array | ✅ OK |
| **Filtro Temas** | "Todos os temas" | THEMES array | ✅ OK |
| **Filtro Salas** | "Todas as salas" | ROOMS array | ✅ OK |
| **Filtro Recursos** | "Todos os recursos" | Pode estar em Sessions.tsx | ⚠️ Verificar |
| **Filtro Status** | "Todos os status" | STATUSES array | ✅ OK |
| **Filtro Turmas** | "Todas as turmas" | TURMAS array | ✅ OK |
| **Período Customizado** | Date range picker | Date range picker | ✅ OK |
| **Navegar Semana** | Prev/Next buttons | ChevronLeft/ChevronRight | ✅ OK |
| **Botão "Hoje"** | Sim | ✓ Sim | ✅ OK |
| **Grade Horária** | 7:00-18:00 | 7-19 (13 horas) | ✅ OK |
| **Slots de 30 min** | Não explícito | SLOT_MINUTES = 30 | ✅ OK |
| **Eventos com Cores** | Sim (Azul/Verde/Amarelo) | 4 cores (primary/success/warning/destructive) | ✅ OK |
| **Status Visuais** | Ícone check, badges | Color mapping + status | ✅ OK |
| **Drag & Drop** | Não visível | Implementado com @dnd-kit | ✓ Extra |
| **Resize de Eventos** | Não visível | Implementado | ✓ Extra |
| **Badge "Módulo"** | Sim | Não encontrado | ❌ Faltando |
| **Badge "Recursos adicionados"** | Sim | Não encontrado | ❌ Faltando |
| **Slots M1/M2/T1/T2** | "M1" label nos eventos | Não encontrado | ❌ Faltando |
| **Exportar Agenda** | Feature mencionada | Não implementado | ❌ Faltando |
| **Indicadores de Ocupação** | OccupancyLevel tipo | Não explícito visualmente | ⚠️ Verificar |

---

**Total de diferenças encontradas:** 8

---

# 🔧 ANÁLISE CORRIGIDA: NewTurmaPage.tsx vs Figma

### 📍 Arquivo: `src/pages/NewTurmaPage.tsx` - 1.361 linhas

**Status**: ✅ **PÁGINA IMPLEMENTADA COM 6 STEPS**

---

## Verificação por Step

### TELA 1: Identificação ✅

**Código**: `StepIdentificacao` (line 184-304)

| Campo | Figma | Código | Status |
|-------|-------|--------|--------|
| **Programa relacionado** | Dropdown | Dropdown ✅ | ✅ Presente |
| **Nome da turma** | Text input | Text input ✅ | ✅ Presente |
| **Sigla da turma** | Text input (uppercase) | Text input ✅ (uppercase) | ✅ Presente |
| **Nome financeiro** | Text input | Text input ✅ | ✅ Presente |
| **Nome fantasia** | Text input | Text input ✅ | ✅ Presente |
| **Código financeiro** | Text input | Text input ✅ | ✅ Presente |
| **Ano de referência** | Text input (4 chars) | Text input ✅ (4 chars max) | ✅ Presente |
| **Auto-geração de nome** | Suggestão com botão "Usar" | UI com Sparkles icon ✅ | ✅ Presente |
| **Step Indicator** | 6 steps visuais | 6 steps com ✅/números | ✅ Presente |

**Resumo TELA 1**: ✅ **COMPLETA** - Todos os 7 campos presentes

---

### TELA 2: Responsáveis ✅

**Código**: `StepResponsaveis` (line 305-350)

| Campo | Figma | Código | Status |
|-------|-------|--------|--------|
| **Diretor do programa** | PeopleAutocomplete | PeopleAutocomplete ✅ | ✅ Presente |
| **Diretor acadêmico (DA)** | PeopleAutocomplete | PeopleAutocomplete ✅ | ✅ Presente |
| **Coordenador** | PeopleAutocomplete | PeopleAutocomplete ✅ | ✅ Presente |
| **Planejamento (DP)** | PeopleAutocomplete | PeopleAutocomplete ✅ | ✅ Presente |
| **Produção de materiais** | PeopleAutocomplete | PeopleAutocomplete ✅ | ✅ Presente |
| **Helper text (DA)** | "O DA receberá pendência de preenchimento da grade" | Presente ✅ | ✅ Presente |

**Resumo TELA 2**: ✅ **COMPLETA** - Todos os 5 campos presentes + helper text

---

### TELA 3: Estrutura Acadêmica ✅

**Código**: `StepEstrutura` (line 351-445)

| Campo | Figma | Código | Status |
|-------|-------|--------|--------|
| **Modalidade** | Dropdown (Presencial/Híbrido/Online) | Dropdown ✅ (3 opções) | ✅ Presente |
| **Local** | Dropdown (Campus ISE/Externo) | Dropdown ✅ (2 opções) | ✅ Presente |
| **Período de datas** | 2 Date pickers (inicio + fim) | DatePicker ✅ x2 (com validação) | ✅ Presente |
| **Dias de programa** | Number input | Number input ✅ | ✅ Presente |
| **Estimativa de alunos** | Number input | Number input ✅ | ✅ Presente |
| **Nº participantes** | Number input | Number input ✅ | ✅ Presente |
| **Tipo de programa** | Dropdown (11 tipos) | Dropdown ✅ (11 tipos) | ✅ Presente |
| **Tooltips** | "EMBA: use ano de conclusão" | Tooltip presente ✅ | ✅ Presente |

**Resumo TELA 3**: ✅ **COMPLETA** - Todos os 7 campos presentes + tooltips

---

### TELA 4: Grade ⚠️ (Parcial)

**Código**: `StepGrade` (line 648-920)

| Elemento | Figma | Código | Status |
|----------|-------|--------|--------|
| **Adicionar módulos** | Button "Adicionar módulo" | Input + Button "Adicionar" ✅ | ✅ Presente |
| **Lista de módulos** | Expandível com disciplinas | Expandível ✅ | ✅ Presente |
| **Editar módulo** | Pencil icon | Pencil button ✅ | ✅ Presente |
| **Deletar módulo** | Trash icon | Trash button ✅ | ✅ Presente |
| **Adicionar disciplina** | Plus button | Plus button ✅ | ✅ Presente |
| **Modal de disciplina** | Form completo | ModalDisciplina component ✅ | ✅ Presente |
| **Sessões contador** | "X sessões" | Counter ✅ | ✅ Presente |
| **Tabela de Atividades não-acadêmicas** | Tabela separada | **NÃO LOCALIZADO** | ❌ Ausente |
| **Drag-and-drop** | Reordenação de disciplinas | GripVertical presente ✅ | ✅ Presente |

**Resumo TELA 4**: ⚠️ **PARCIAL** - Disciplinas OK, mas Atividades não-acadêmicas faltando

---

### TELA 5: Detalhes das Sessões ⚠️ (Stub)

**Código**: `StepDetalhes` (line 925-968)

| Elemento | Figma | Código | Status |
|----------|-------|--------|--------|
| **Conteúdo principal** | Form com detalhes | Placeholder "Detalhes das Sessões" | ❌ Stub apenas |
| **Estrutura** | Sessões com dados | Título + "Em desenvolvimento" | ❌ Incompleto |

**Resumo TELA 5**: ❌ **NÃO IMPLEMENTADO** - Apenas stub/placeholder

---

### TELA 6: Dias de Aula ⚠️ (Stub)

**Código**: `StepDiasAula` (line 1046-1080)

| Elemento | Figma | Código | Status |
|----------|-------|--------|--------|
| **Conteúdo principal** | Seleção de dias | Placeholder "Dias de Aula" | ❌ Stub apenas |
| **Integração com calendário** | Calendário integrado | Não existe | ❌ Faltando |

**Resumo TELA 6**: ❌ **NÃO IMPLEMENTADO** - Apenas stub/placeholder

---

## Recursos Adicionais Implementados

| Recurso | Status |
|---------|--------|
| **ClonarTemplateModal** | ✅ Modal completo (3 abas: Turma Anterior, Template, Cópias) |
| **PeopleAutocomplete** | ✅ Component com PEOPLE array (9 pessoas) |
| **DatePicker** | ✅ Component com validação de datas |
| **StepIndicator** | ✅ Component visual com 6 steps |
| **FieldLabel** | ✅ Component com required/optional/tooltip |
| **Validação de formulário** | ✅ Error handling por field |
| **State management** | ✅ TurmaFormData interface completa |
| **TIPO_PROGRAMA** | ✅ Array com 11 tipos |
| **MODALIDADES** | ✅ Array com 3 opções |
| **LOCAIS** | ✅ Array com 2 opções |
| **ModalDisciplina** | ✅ Modal para adicionar disciplinas |

---

## 📊 Resumo NewTurmaPage.tsx

| Item | Figma | Código | Status |
|------|-------|--------|--------|
| **Página "Nova Turma"** | Completa | Implementada ✅ | ✅ Presente |
| **Step Indicator (6 steps)** | Sim | Sim ✅ | ✅ Presente |
| **TELA 1 (Identificação)** | Completa (7 campos) | Completa ✅ (7 campos) | ✅ OK |
| **TELA 2 (Responsáveis)** | Completa (5 campos) | Completa ✅ (5 campos) | ✅ OK |
| **TELA 3 (Estrutura)** | Completa (7 campos) | Completa ✅ (7 campos) | ✅ OK |
| **TELA 4 (Grade)** | Completa (módulos + atividades) | Parcial ⚠️ (módulos OK, atividades ausentes) | ⚠️ 70% |
| **TELA 5 (Detalhes)** | Completa | Stub apenas | ❌ 0% |
| **TELA 6 (Dias)** | Completa | Stub apenas | ❌ 0% |
| **Modal Clone** | Sim | Sim ✅ (3 tabs + search) | ✅ Presente |
| **Validação** | Por field | Por field ✅ | ✅ Presente |
| **Auto-geração nome** | Sim | Sim ✅ | ✅ Presente |

---

## 🔴 O que está Faltando em NewTurmaPage.tsx

1. **TELA 4 (Grade)**: Tabela de "Atividades não-acadêmicas" não está implementada
2. **TELA 5 (Detalhes das Sessões)**: Apenas stub/placeholder - precisa implementação
3. **TELA 6 (Dias de Aula)**: Apenas stub/placeholder - precisa integração com calendário
4. **Preview visual**: Não há visualização prévia dos dados antes de salvar
5. **Persistência**: Dados não são salvos (mock apenas)
6. **Workflows**: Botão "Descartar" e "Próximo"/"Anterior" existem mas lógica incompleta

---

---

### 📍 Arquivo: Não encontrado no código

**Status**: ❌ **PÁGINA COMPLETAMENTE AUSENTE**

Figma possui página completa de relatórios e consultas avançadas, mas não há correspondência no código.

---

## Estrutura da Página "Relatórios"

### Abas

| Aba | Figma | Código | Diferença |
|-----|-------|--------|-----------|
| **Relatórios padrão** | Presente (primeira aba) | Não existe | **PÁGINA AUSENTE** |
| **Consultas avançadas** | Presente (segunda aba - foco atual) | Não existe | **PÁGINA AUSENTE** |

### Header da Página

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Relatórios e Consultas" (20px) | Não existe | **PÁGINA AUSENTE** |
| **Subtitle** | "Gestão de relatórios padronizados, horários oficiais e consultas dinâmicas" | Não existe | - |

### Info Box

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Mensagem** | "Todos os relatórios são gerados diretamente da base oficial do sistema, garantindo dados em tempo real e eliminando divergências entre áreas." | Não existe | **AUSENTE** |

### Report Cards - Estrutura

Cada card contém:
- Input de data picker ("selecione as datas")
- Button de tipo (Acadêmico/Pedagógico/Logístico)
- Título e descrição
- Metadata (Última geração + data)
- Button "Pré-visualizar"
- Buttons de download (PDF + Excel)

### Report Card 1: Grades e Outlines Acadêmicos

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Type Button** | "Acadêmico" | Não existe | **CARD AUSENTE** |
| **Title** | "Grades e Outlines Acadêmicos" | Não existe | - |
| **Description** | "Consolidação de informações pedagógicas, temas, ca..." | Não existe | - |
| **Last Generated** | "Última geração: 24/03/2026 10:30" | Não existe | - |
| **Preview Button** | "Pré-visualizar" | Não existe | - |
| **Download Buttons** | PDF + Excel | Não existe | - |

### Report Card 2: Documentos Utilizados

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Type Button** | "Pedagógico" | Não existe | **CARD AUSENTE** |
| **Title** | "Documentos Utilizados" | Não existe | - |
| **Description** | "Listagem de materiais vinculados com metadados do..." | Não existe | - |
| **Last Generated** | "Última geração: 23/03/2026 15:45" | Não existe | - |

### Report Card 3: Ocupação de Recursos

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Type Button** | "Logístico" | Não existe | **CARD AUSENTE** |
| **Title** | "Ocupação de Recursos" | Não existe | - |
| **Description** | "Consolidação de informações pedagógicas, temas, ca..." | Não existe | - |
| **Last Generated** | "Última geração: 24/03/2026 10:30" | Não existe | - |

### Report Card 4: Requisições Acadêmicas (RAs)

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Type Button** | "Logístico" | Não existe | **CARD AUSENTE** |
| **Title** | "Requisições Acadêmicas (RAs)" | Não existe | - |

---

## 📊 Resumo Relatórios

| Item | Figma | Código | Status |
|------|-------|--------|--------|
| Página "Relatórios e Consultas" | Completa | Não existe | ❌ Faltando |
| Aba "Relatórios padrão" | Presente | Não existe | ❌ Faltando |
| Aba "Consultas avançadas" | Presente (foco) | Não existe | ❌ Faltando |
| Info box informativo | Sim | Não existe | ❌ Faltando |
| 4 Report Cards | Sim | Não existe | ❌ Faltando |
| Input date picker | Sim | Não existe | ❌ Faltando |
| Type selector buttons | 3 tipos | Não existe | ❌ Faltando |
| Preview functionality | Sim | Não existe | ❌ Faltando |
| PDF/Excel export | Sim | Não existe | ❌ Faltando |

---

---

# TELA 10: Horário Oficial (944-8287)

### 📍 Arquivo: Não encontrado no código

**Status**: ❌ **PÁGINA COMPLETAMENTE AUSENTE**

Figma possui página completa de horário oficial com aprovação e visualização, mas não há correspondência no código.

---

## Estrutura da Página "Horário Oficial"

### Header da Página

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Horário Oficial" (20px) | Não existe | **PÁGINA AUSENTE** |
| **Subtitle** | "Formalização e distribuição da grade acadêmica" | Não existe | - |

### Processo de Aprovação (Info Box)

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Título da seção** | "Processo de aprovação do horário oficial" | Não existe | **BOX AUSENTE** |
| **Descrição** | "Após aprovação pelo DP ou DA, o PDF fica disponível automaticamente e as notificações são disparadas para Materiais, Atendimento, Catering e TI." | Não existe | - |

### Filtros

| Filtro | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Todos os programas** | Dropdown | Não existe | **FILTROS AUSENTES** |
| **Todas as turmas** | Dropdown | Não existe | - |
| **Todos os status** | Dropdown | Não existe | - |
| **Período customizado** | Date range picker (03/09 até 03/15/2026) | Não existe | - |

### Tabela - Colunas

| Coluna | Figma | Código | Diferença |
|--------|-------|--------|-----------|
| **Programa/turma** | Text | Não existe | **TABELA AUSENTE** |
| **Período** | Text (ex: "Mar – Nov 2024") | Não existe | - |
| **Sessões** | Number (ex: "24") | Não existe | - |
| **Conflitos** | Number (ex: "0") | Não existe | - |
| **Status** | Badge (ex: "Aguardando") | Não existe | - |
| **Publicado em** | Date (ex: "01/03/2024") | Não existe | - |
| **Ações** | Buttons (Aprovar/Recusar/PDF/Notificar) | Não existe | - |

### Dados da Tabela - Exemplo de Linhas

| Turma | Período | Sessões | Conflitos | Status | Publicado | Ações |
|-------|---------|---------|-----------|--------|-----------|-------|
| MBA Executivo – T24A | Mar – Nov 2024 | 24 | 0 | Aguardando | 01/03/2024 | Aprovar / Recusar |
| Gestão de Pessoas – T24A | Mar – Nov 2024 | 24 | 0 | Aprovado | -- | PDF / Notificar |
| Liderança Estratégica – T24B | Mar – Nov 2024 | 24 | 1 | Publicado | 13/04/2026 | PDF / Notificar |
| Inovação e Startups – T24C | Mar – Nov 2024 | 24 | 1 | Publicado | --- | PDF / Notificar |

### Modal: Pré-visualização — Horário Oficial

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Modal Title** | "Pré-visualização — Horário Oficial" | Não existe | **MODAL AUSENTE** |
| **Program info** | "MBA Executivo - T24A • Mar - Nov 2024" | Não existe | - |

### Modal Filters

| Filtro | Figma | Tipo | Código | Diferença |
|--------|-------|------|--------|-----------|
| **Todos os dias** | Button/Select | Select | Não existe | **AUSENTE** |
| **Período customizado** | Date range picker | Date inputs | Não existe | **AUSENTE** |

### Modal Checkboxes (Filtro de Exibição)

| Checkbox | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Atividades logísticas** | Presente (unchecked) | Não existe | **AUSENTE** |
| **Exibir RAs** | Presente (unchecked) | Não existe | **AUSENTE** |
| **Atividades não acadêmicas** | Presente (unchecked) | Não existe | **AUSENTE** |
| **Atividades acadêmicas** | Presente (unchecked) | Não existe | **AUSENTE** |

### Modal Content - Schedule Display

| Elemento | Figma | Estrutura | Código | Diferença |
|----------|-------|-----------|--------|-----------|
| **Turma Header** | "MBA Executivo - T24A" | Text grande + "INSTITUTO SUPERIOR DE ENSINO" | Não existe | **AUSENTE** |
| **Período** | "Mar - Nov 2024" | Smaller text | Não existe | - |
| **Publicação info** | "Publicado em 01/03/2024" | Metadata | Não existe | - |
| **Versão** | "Versão: v3" | Metadata | Não existe | - |
| **Activities by Day** | "Atividades - Dia 15/03" | Collapsible section | Não existe | - |

### Modal Activities Example

| Campo | Figma | Exemplo | Código | Diferença |
|-------|-------|---------|--------|-----------|
| **Hora** | Time range | "07:45-08:00" | Não existe | **AUSENTE** |
| **Activity 1** | Activity name | "Welcome Coffee" | Não existe | - |
| **Activity 2** | Activity name | "Welcome Coffee" | Não existe | - |
| **Local** | Location | "Foyer Principal" | Não existe | - |
| **Professor** | Person | "Dr. Carlos Faria" | Não existe | - |
| **Hora (Row 2)** | Time range | "09:00-10:00" | Não existe | - |
| **Activity (Row 2)** | Activity name | "R. Equipe" | Não existe | - |
| **Subject** | Subject | "Direito e Economia" | Não existe | - |
| **Local (Row 2)** | Location | "Sala 202" | Não existe | - |

---

## 📊 Resumo Horário Oficial

| Item | Figma | Código | Status |
|------|-------|--------|--------|
| Página "Horário Oficial" | Completa | Não existe | ❌ Faltando |
| Info box de processo | Sim | Não existe | ❌ Faltando |
| Filtros (4 tipos) | Sim | Não existe | ❌ Faltando |
| Tabela (4 linhas + 7 colunas) | Sim | Não existe | ❌ Faltando |
| Status badges | Aguardando/Aprovado/Publicado | Não existe | ❌ Faltando |
| Ações (Aprovar/Recusar/PDF/Notificar) | Sim | Não existe | ❌ Faltando |
| Modal pré-visualização | Sim | Não existe | ❌ Faltando |
| Modal filters + checkboxes | Sim | Não existe | ❌ Faltando |
| Schedule display por dia | Sim (atividades com horários) | Não existe | ❌ Faltando |

---

---

# TELA 11: Pré-Reservas (944-7721)

### 📍 Arquivo: Não encontrado no código

**Status**: ❌ **PÁGINA COMPLETAMENTE AUSENTE**

Figma possui página completa de pré-reservas com solicitações e aprovações, mas não há correspondência no código.

---

## Estrutura da Página "Pré-Reservas"

### Header da Página

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Title** | "Pré-Reservas" (20px) | Não existe | **PÁGINA AUSENTE** |
| **Subtitle** | "Solicitações e aprovação de recursos" | Não existe | - |

### Info Box

| Elemento | Figma | Código | Diferença |
|----------|-------|--------|-----------|
| **Mensagem** | "Verifique a disponibilidade no calendário antes de criar uma pré-reserva." | Não existe | **BOX AUSENTE** |
| **Link** | "Ver calendário →" | Não existe | - |

### Stat Cards - Pré-Reservas

| Card | Figma | Ícone | Número | Código | Diferença |
|------|-------|-------|--------|--------|-----------|
| **Pendentes** | Presente | Card icon | 2 | Não existe | **CARDS AUSENTES** |
| **Aprovadas** | Presente | Card icon | 2 | Não existe | - |
| **Conflitos** | Presente | Card icon | 1 | Não existe | - |
| **Recusadas** | Presente | Card icon | 1 | Não existe | - |

### Tabs de Filtro

| Tab | Figma | Código | Diferença |
|-----|-------|--------|-----------|
| **Todas** | Presente | Não existe | **TABS AUSENTES** |
| **Pendentes** | Presente | Não existe | - |
| **Conflitos** | Presente | Não existe | - |
| **Aprovadas** | Presente | Não existe | - |
| **Recusadas** | Presente | Não existe | - |
| **Canceladas** | Presente | Não existe | - |

### Buttons (Ações)

| Button | Figma | Ícone | Código | Diferença |
|--------|-------|-------|--------|-----------|
| **Exportar XLS** | Presente | Export icon | Não existe | **BUTTONS AUSENTES** |
| **Nova Pré-Reserva** | Presente (Primary) | Plus icon | Não existe | - |

### Tabela - Colunas

| Coluna | Figma | Tipo | Código | Diferença |
|--------|-------|------|--------|-----------|
| **Programa** | Text + checkbox | Text | Não existe | **TABELA AUSENTE** |
| **Recurso** | Text (ex: "Sala 201") | Text | Não existe | - |
| **Data / Hora** | Date + Time (ex: "15/03/2024" + "08:00 – 12:00") | Date + Time | Não existe | - |
| **Solicitado por** | Person name + role (ex: "Dir. Carlos Faria") | Person | Não existe | - |
| **Status** | Badge (ex: "Aguardando", "Aprovado", "Conflito") | Badge | Não existe | - |
| **Ações** | Buttons (Aprovar/Recusar ou Ver detalhes) | Buttons | Não existe | - |

### Dados da Tabela - Exemplo de Linhas

| # | Programa | Recurso | Data | Hora | Solicitado por | Status | Ações |
|---|----------|---------|------|------|----------------|--------|-------|
| 1 | MBA Executivo – T24A | Sala 201 | 15/03/2024 | 08:00 – 12:00 | Dir. Carlos Faria | Aguardando | Aprovar / Recusar |
| 2 | Marketing Digital – T24A | Auditório A | 20/03/2024 | 09:00 – 13:00 | Dir. Beatriz Campos | Aprovado | Ver detalhes |
| 3 | Liderança Estratégica – T24B | Dr. Marcos Lima | 18/03/2024 | 14:00 – 17:00 | Dir. Carlos Faria | Conflito | Aprovar / Recusar |
| 4 | Gestão de Pessoas – T24A | Sala 302 | 14/03/2024 | 08:00 – 11:00 | Dir. Helena Costa | Aprovado | Ver detalhes |
| 5 | Inovação e Startups – T24C | Lab. Digital | 22/03/2024 | 09:00 – 12:00 | Dir. (nome cortado) | (status) | (ações) |

### Status Badges - Tipos

| Status | Figma | Ícone | Cor | Código | Diferença |
|--------|-------|-------|-----|--------|-----------|
| **Aguardando** | Icon + texto | Status icon | Orange/warning | Não existe | **AUSENTE** |
| **Aprovado** | Icon + texto | Status icon | Green/success | Não existe | **AUSENTE** |
| **Conflito** | Icon + texto | Status icon | Red/error | Não existe | **AUSENTE** |
| **Recusado** | Icon + texto | Status icon | Red/error | Não existe | **AUSENTE** |

---

## 📊 Resumo Pré-Reservas

| Item | Figma | Código | Status |
|------|-------|--------|--------|
| Página "Pré-Reservas" | Completa | Não existe | ❌ Faltando |
| Info box de orientação | Sim + link | Não existe | ❌ Faltando |
| 4 Stat Cards | Pendentes(2), Aprovadas(2), Conflitos(1), Recusadas(1) | Não existe | ❌ Faltando |
| 6 Filter tabs | Todas, Pendentes, Conflitos, Aprovadas, Recusadas, Canceladas | Não existe | ❌ Faltando |
| "Exportar XLS" button | Sim | Não existe | ❌ Faltando |
| "Nova Pré-Reserva" button | Sim (Primary) | Não existe | ❌ Faltando |
| Tabela (5+ linhas × 6 colunas) | Sim | Não existe | ❌ Faltando |
| Status badges com ícones | 4 tipos | Não existe | ❌ Faltando |
| Ações (Aprovar/Recusar/Ver detalhes) | Sim | Não existe | ❌ Faltando |

---

---

# 🔴 RESUMO CONSOLIDADO - TODAS AS TELAS ANALISADAS

## Features Presentes no Figma, Ausentes no Código (Nova Turma):

1. **Turma como entidade separada** - Figma mostra fluxo de criar Turma, código tem Programa
2. **6 Steps do form** - Identificação, Responsáveis, Estrutura, Grade, Dias de Aula, Detalhes das Sessões
3. **Múltiplos responsáveis específicos** - Diretor Programa, Diretor Acadêmico, Coordenador da Turma, etc.
4. **Campos multilíngues** - Nomes em português, inglês, espanhol
5. **Tabela de disciplinas** - Com Área, Modalidade, Professor, Sessões
6. **Atividades não-acadêmicas** - Coffee breaks, almoços, deslocamentos, recepções
7. **Integração Financeira** - Nome e Código Financeiro
8. **Clonagem de templates** - Fluxo completo
9. **Alocação de slots** - M1, M2, T1, T2 blocos de horários
10. **Workflow de confirmação** - Solicitação de recursos bloqueados

## Fluxos/Jornadas do Figma Não Implementadas:

- US 3.2.1: Criar turma em Rascunho
- US 3.2.2: Clonar estruturas/templates
- US 3.2.3: Cadastrar atividades operacionais
- US 3.2.4: Submeter turma para workflow
- US 4.2.1: Distribuir slots de sessões
- US 4.2.2: Solicitar confirmação de recursos
- US 4.2.3: Preencher dados de recursos não-acadêmicos
- US 4.3.1: Vincular materiais e metadados

## Diferenças Críticas por Página:

| Seção | Figma | Código | Status |
|-------|-------|--------|--------|
| **Login** | Presente | Não encontrado | ❌ Faltando |
| **Dashboard - Stat Cards** | 5 cards específicos | 5 cards com labels diferentes | ⚠️ Diferente |
| **Dashboard - Turma 6** | Imersão Design – T2026E | Não existe | ❌ Faltando |
| **Dashboard - Status "Active"** | "Ativa/Em andamento" | Verificar alinhamento | ⚠️ Revisar |
| **Nova Turma - TELA 1** | 7 campos | 7 campos ✅ | ✅ OK |
| **Nova Turma - TELA 2** | 5 campos | 5 campos ✅ | ✅ OK |
| **Nova Turma - TELA 3** | 7 campos | 7 campos ✅ | ✅ OK |
| **Nova Turma - TELA 4 (Grade)** | Disciplinas + Atividades | Apenas Disciplinas | ⚠️ Parcial |
| **Nova Turma - TELA 5** | Form completo | Apenas stub | ❌ Faltando |
| **Nova Turma - TELA 6** | Calendário integrado | Apenas stub | ❌ Faltando |
| **Nova Turma - Clone Modal** | 3 abas funcional | 3 abas não funcional | ⚠️ Incompleto |
| **Tarefas (Tasks)** | Página completa | Não existe | ❌ Faltando |
| **Relatórios** | Página completa | Não existe | ❌ Faltando |
| **Horário Oficial** | Página completa | Não existe | ❌ Faltando |
| **Pré-Reservas** | Página completa | Não existe | ❌ Faltando |

## Estatísticas Consolidadas

| Métrica | Valor |
|---------|-------|
| Total de steps Figma (Nova Turma) | 6 |
| Steps implementados no código | 3 completos + 1 parcial + 2 stubs = 4/6 |
| Compatibilidade NewTurmaPage | **~70%** |
| Telas analisadas (todas sessões) | 14+ |
| Diferenças críticas encontradas | 8+ |
| **PÁGINAS COMPLETAMENTE AUSENTES** | **4 páginas** (Tarefas, Relatórios, Horário Oficial, Pré-Reservas) |
| **PÁGINAS BEM IMPLEMENTADAS** | **3 páginas** (Nova Turma 70%, Calendário 95%, Programs 80%) |

---

## ✅ O que está Alinhado

- ✓ PEOPLE array: 9 nomes idênticos
- ✓ TIPO_PROGRAMA: 11 tipos idênticos  
- ✓ Alert messages (Dashboard): idênticas
- ✓ Task titles (Dashboard): idênticas  
- ✓ Turmas 1-5 (Dashboard): nomes idênticos
- ✓ Status "draft" e "pending": alinhadas
- ✓ Layout global (Sidebar + Header): compatível
- ✓ Buttons básicos (Descartar, Próximo, etc.): compatíveis

---

## 📋 Próximas Passos Sugeridos

Para completar o alinhamento com Figma:

### NewTurmaPage.tsx - Completion (Passos 1-5)

1. **COMPLETAR TELA 5 (Detalhes das Sessões)**:
   - Atualmente: apenas stub/placeholder
   - Fazer: Implementar form completo com campos de detalhes de cada sessão
   - Campos: Título, descrição, instrutor, recursos necessários, etc.

2. **COMPLETAR TELA 6 (Dias de Aula)**:
   - Atualmente: apenas stub/placeholder
   - Fazer: Integrar com CalendarPage para seleção de dias letivos
   - Campos: Calendário, checkboxes de dias, preview de carga horária

3. **Adicionar TELA 4 - Atividades não-acadêmicas**:
   - Atualmente: Tab de Disciplinas OK, mas Atividades não-acadêmicas faltando
   - Fazer: Segunda tabela/seção para Atividades (coffee breaks, Welcome Coffee, etc.)
   - Referência: Figma TELA 4 (Grade) tem 2 tabelas

4. **Implementar Persistência de Dados**:
   - Salvar estado do formulário (local storage ou API)
   - Implementar "Rascunho" e "Salvar"
   - Restaurar dados em reload

5. **Modal de Clonagem - Completar Logic**:
   - Atualmente: UI completa, mas fluxo de clonagem não executa
   - Fazer: Copiar dados da turma/template selecionados para novo form

### Dashboard - Fixes (Passos 6-8)

6. **Corrigir Labels dos Stat Cards**:
   - Figma: Verificar labels exatos esperados
   - Código: Confirmar alinhamento

7. **Adicionar Turma 6 (Dashboard)**:
   - Figma: "Imersão Design – T2026E"
   - Código: Atualmente mostra 5 turmas
   - Fazer: Adicionar 6ª turma ao array de mock data

### Páginas Completamente Ausentes (Passos 9-12)

9. **CRIAR: TasksPage.tsx** com:
   - 4 stat cards (Pendentes, Próximas do prazo, Atrasadas, Finalizadas)
   - 5 abas de filtro (Todas, Pendentes, Concluídas, Próximas do prazo, Atrasadas)
   - Campo de busca por tarefa
   - 4 filtros avançados (Apenas as minhas, Todos os programas, Todas as turmas, Período customizado)
   - Tabela com 5 colunas (Tarefa, Programa/Turma, Responsável, Prazo, Status)
   - Status badges com cores (Atrasada = red)

10. **CRIAR: ReportsPage.tsx** com:
    - 2 Abas (Relatórios padrão + Consultas avançadas)
    - 4+ Report Cards dinâmicos
    - Input date picker e seletor de tipo para cada card
    - Buttons "Pré-visualizar" e download (PDF + Excel)
    - Metadata "Última geração" de cada relatório

11. **CRIAR: OfficialSchedulePage.tsx** com:
    - Tabela de horários (Programa, Período, Sessões, Conflitos, Status, Publicado, Ações)
    - 4 Filtros (Programas, Turmas, Status, Período customizado)
    - Modal "Pré-visualização — Horário Oficial" com:
      - 4 Checkboxes de exibição (Atividades logísticas, RAs, Não-acadêmicas, Acadêmicas)
      - Schedule display por dia com atividades, horários, locais, professores
    - Buttons: Aprovar, Recusar, PDF, Notificar

12. **CRIAR: PreReservasPage.tsx** com:
    - Info box de orientação com link para calendário
    - 4 Stat Cards (Pendentes, Aprovadas, Conflitos, Recusadas)
    - 6 Filter tabs (Todas, Pendentes, Conflitos, Aprovadas, Recusadas, Canceladas)
    - Buttons: "Exportar XLS", "Nova Pré-Reserva"
    - Tabela com 6 colunas (Programa, Recurso, Data/Hora, Solicitado por, Status, Ações)
    - Status badges e action buttons (Aprovar/Recusar/Ver detalhes)
    - Integration com calendário para validação de disponibilidade

## 🔴 Páginas Completamente Ausentes no Código

1. **Tarefas (Tasks)** - Não existe nenhuma implementação
2. **Relatórios (944-11639)** - Página de relatórios e consultas avançadas
3. **Horário Oficial (944-8287)** - Página de formalização e distribuição da grade acadêmica
4. **Pré-Reservas (944-7721)** - Página de solicitações e aprovação de recursos

## ⚠️ Páginas com Inconsistências Críticas

1. **Dashboard** - Labels de stat cards diferentes, turma 6 faltando
2. **Nova Turma (TELA 5 + 6)** - Stubs sem implementação, precisam ser completadas
3. **Nova Turma (TELA 4)** - Atividades não-acadêmicas faltando na segunda tabela

## ✅ Páginas Bem Implementadas

1. **Nova Turma (TELA 1-3)** - Identificação, Responsáveis e Estrutura acadêmica completas
   - **70% geral**: 3 telas completas, 1 parcial, 2 stubs

2. **Calendário** - Implementação completa com visualizações múltiplas, filtros, eventos, drag-drop
   - **Faltando**: Feature de exportação, Badge "Recursos adicionados", Overflow visual (+5 items)

3. **Programs** - Página de programas com lista funcional
   - **Status**: Básico mas funcional



