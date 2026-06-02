# Divergências: Figma vs Código

**Data:** 02/06/2026

---

## 1. Divergências entre Figma e código atual

Diferenças identificadas sem justificativa documentada ou decisão registrada.

---

### Nova Turma — Grade (Step 4)

A tela de Grade existe no código (`/programs/turma/new`, Step 4), mas com estrutura diferente do Figma:
- **Estrutura por módulos vs. tabela plana.** Figma mostra uma tabela flat com colunas: Disciplina, Área acadêmica, Modalidade, Professor, Sessões. O código organiza as disciplinas dentro de módulos colapsáveis — a coluna "Área acadêmica" não existe.
- **Seção "Atividades não acadêmicas" ausente.** Figma prevê tabela separada para atividades como coffee break, recepções e deslocamentos. Não implementada.

---

### Nova Turma — Responsáveis (Step 2)

Campos do Figma parcialmente remapeados com nomes diferentes:
- Figma: `"Diretor(a) de turma"` → Código: `"Planejamento (DP)"` — nomes distintos, pode ser o mesmo papel ou não.
- Figma: `"Coordenador(a) acadêmico(a)"` → Código: `"Coordenador"` — label simplificado.

---

### Dashboard

- **Labels dos Stat Cards diferentes.**
  - Figma: `"87 Professores"` → Código: `"Professores Alocados (hoje)"`
  - Figma: `"18 Salas provisionadas"` → Código: `"Salas Reservadas (hoje)"`
  - Código tem 2 cards extras sem correspondência no Figma: `"Alunos previstos hoje (campus ISE)"` e `"Alunos previstos amanhã (campus ISE)"`
- **Turma faltando na lista.** Figma lista 6 turmas; código lista 5. Ausente: `"Imersão Design – T2026E"`.
- **Status label diferente.** Figma: `"Ativa/Em andamento"`. Código: `"Aprovada/Em andamento"`.

---

### Calendário

- **Slots M1/M2/T1/T2 ausentes nos eventos do CalendarPage.** Os slots existem no formulário de criação de turma (`NewTurmaPage`), mas os eventos exibidos no calendário (`CalendarPage`) não exibem essa informação nos cards.
- **Badge "Módulo" ausente** nos cards de evento do calendário.
- **Badge "Recursos adicionados" ausente** nos cards de evento do calendário.
- **Exportação de agenda não implementada.** Feature prevista no Figma como "Exportar agenda com filtros aplicados".

---

### Tarefas

- **Página de Tarefas independente ausente.** Figma prevê uma página dedicada (`/tarefas`) com: 4 stat cards, 5 abas de filtro, campo de busca, filtros avançados por programa/turma/período e tabela com 5 colunas. O código tem o `TurmaCPanelPage` (CPL) dentro de cada turma, que é diferente — não agrega tarefas de todas as turmas em um único painel.

---

### Outros

- **Workflow de confirmação de recursos não implementado** (US 4.2.2). Figma prevê fluxo para solicitar confirmação definitiva de recursos com status "reserva bloqueada".

---

## 2. Divergências justificadas por alterações de contexto

Diferenças que possuem decisão documentada, refletindo mudanças intencionais após a criação do Figma.

---

### Nova Turma — Campos simplificados
> Ref: Alteração 10 — *"Simplificação dos Campos de Cadastro"*

- **Campos "Nome fantasia (Inglês)" e "Nome fantasia (espanhol)" removidos.** Figma previa campos fixos por idioma. Decisão: manter apenas um campo único de nome fantasia. Letícia: *"A gente deixa um campo só e se precisar, tipo, adicionar."*
- **Campo "Modalidade" movido para a Turma.** Figma previa modalidade no Programa. Decisão: modalidade pertence à Turma e ao Dia de Aula, pois uma mesma turma pode ter dias com modalidades diferentes. Implementado no Step 3 (Estrutura Acadêmica) da `NewTurmaPage`.
- **Geração automática do nome da turma implementada.** Figma previa campo read-only genérico. Código implementa sugestão automática com regra de negócio: EMBA usa ano de conclusão; todos os outros tipos usam ano de início.

---

### Nova Turma — Responsáveis
> Ref: Alteração 10 — *"Cargos e Responsáveis"*

- **"Diretor(a) acadêmico(a)" implementado como opcional.** Figma marcava o campo como obrigatório (`*`). Decisão: no momento da criação, essa definição muitas vezes ainda não existe. Somente o Diretor de Programa é obrigatório.

---

### Login e privacidade
> Ref: Alteração 12 — *"Login via SSO Microsoft e Privacidade"*

- **Login implementado com SSO Microsoft.** `Login.tsx` existe e inclui botão de login Microsoft (SSO) além do formulário convencional.
- **Cards públicos removidos da tela inicial.** Figma exibia cards no lado esquerdo com informações internas. Decisão: remover por questões de privacidade.

---

### Reservas — Campos removidos
> Ref: Alteração 11 — *"Cadastro de Reservas (Bloqueio vs. Reserva)"*

- **Campos "layout da sala", "buffer" e "equipamentos" ausentes.** Considerados desnecessários para reservas fora de programas acadêmicos. Distinção conceitual definida: Bloqueio = pessoas/professores; Reserva = espaços físicos.

---

### Calendário — Visualização e interação
> Ref: Alterações 1, 2, 3, 4, 5, 6, 7, 8, 9

- **Visualização horizontal do calendário (recursos na esquerda, horários no topo).** Alteração 1. Inversão solicitada para facilitar arrastar blocos entre recursos.
- **Filtro para exibir o que está livre** em vez do que está ocupado. Alteração 2. Luis: *"Eu quero ver o que não está ocupado."*
- **Arrastar sessões com feedback visual de conflito em tempo real.** Alteração 3. Sistema deve exibir borda vermelha ao arrastar para horário inválido.
- **Snap/Dominó — ajuste automático de atividades subsequentes.** Alterações 4 e 6. Qualquer alteração de horário deve empurrar ou puxar todas as atividades seguintes do dia. *"O sistema não pode permitir furo."*
- **Modal de confirmação para grade incompleta** em vez de bloqueio total. Alteração 5. Sistema alerta o usuário mas permite prosseguir.
- **Heatmap de ocupação com tooltip detalhado.** Alteração 7. Visualização mensal/trimestral com código de cores (verde/laranja/vermelho) e tooltip ao passar o mouse mostrando salas e programas alocados.
- **Sugestão automática de datas** considerando disponibilidade de professores e salas. Alteração 8. Feature nova não prevista no Figma original.
- **Exportação dinâmica de relatórios** refletindo os filtros aplicados na tela (PDF ou Excel). Alteração 9. Comportamento diferente do previsto no Figma.

---

### Painel de Tarefas e Entregas (CPL/cPanel)
> Ref: Alteração 13 — *"Painel de Tarefas e Entregas"*

- **Painel CPL implementado dentro da Turma** (`/programs/turma/cpanel`). Decisão de centralizar o controle de entregas (Moodle, horários, outlines) no sistema, substituindo planilhas manuais no Teams. A divergência em relação ao Figma é que o Figma previa uma página global de tarefas; o código implementou como painel dentro de cada turma.

---

### Materiais pedagógicos
> Ref: Alteração 13 e US 4.3.1

- **Integração com Moodle prevista via placeholder.** Figma previa seção para vincular materiais por sessão. O código tem a aba "Materiais" no modal de sessão e um bloco informativo sobre Moodle na grade — indicando que a integração via API está planejada mas não ativa.
