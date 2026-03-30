// ============================================================
//  server.js — API REST de Tarefas com Express
//  Porta 3000 | Serve o frontend estático
// ============================================================

const express = require("express");
const path    = require("path");
const app     = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ============================================================
//  ARRAY — banco de dados em memória
// ============================================================
const tarefas = [];
let nextId = 1;

const PRIORIDADES = ["baixa", "media", "alta"];
const STATUS      = ["pendente", "em andamento", "concluída"];

// ── Validação ────────────────────────────────────────────────
function validarTarefa(dados, isUpdate = false) {
  const { titulo, prioridade, status } = dados;
  if (!isUpdate) {
    if (!titulo || typeof titulo !== "string" || titulo.trim() === "")
      throw new Error("'titulo' é obrigatório.");
    if (!prioridade || !PRIORIDADES.includes(prioridade))
      throw new Error(`'prioridade' deve ser: ${PRIORIDADES.join(", ")}.`);
  }
  if (titulo !== undefined && titulo.trim() === "")
    throw new Error("'titulo' não pode ser vazio.");
  if (prioridade !== undefined && !PRIORIDADES.includes(prioridade))
    throw new Error(`'prioridade' deve ser: ${PRIORIDADES.join(", ")}.`);
  if (status !== undefined && !STATUS.includes(status))
    throw new Error(`'status' deve ser: ${STATUS.join(", ")}.`);
}

// ============================================================
//  C — CREATE
// ============================================================
app.post("/tarefas", (req, res) => {
  try {
    validarTarefa(req.body);
    const tarefa = {
      id:          nextId++,
      titulo:      req.body.titulo.trim(),
      descricao:   req.body.descricao?.trim() || "",
      prioridade:  req.body.prioridade,
      status:      "pendente",
      criadaEm:    new Date().toISOString(),
      concluidaEm: null,
    };
    tarefas.push(tarefa);
    res.status(201).json(tarefa);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// ============================================================
//  R — READ ALL
// ============================================================
app.get("/tarefas", (_req, res) => res.json(tarefas));

// ============================================================
//  R — READ BY ID
// ============================================================
app.get("/tarefas/:id", (req, res) => {
  const t = tarefas.find((t) => t.id === Number(req.params.id));
  t ? res.json(t) : res.status(404).json({ erro: "Tarefa não encontrada." });
});

// ============================================================
//  U — UPDATE
// ============================================================
app.put("/tarefas/:id", (req, res) => {
  try {
    validarTarefa(req.body, true);
    const index = tarefas.findIndex((t) => t.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ erro: "Tarefa não encontrada." });

    const ant      = tarefas[index];
    const novoSt   = req.body.status ?? ant.status;

    tarefas[index] = {
      ...ant, ...req.body,
      id:          ant.id,
      criadaEm:    ant.criadaEm,
      status:      novoSt,
      concluidaEm: novoSt === "concluída" && ant.status !== "concluída"
        ? new Date().toISOString()
        : novoSt !== "concluída" ? null : ant.concluidaEm,
      atualizadaEm: new Date().toISOString(),
    };
    res.json(tarefas[index]);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// ============================================================
//  D — DELETE
// ============================================================
app.delete("/tarefas/:id", (req, res) => {
  const index = tarefas.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ erro: "Tarefa não encontrada." });
  const [removida] = tarefas.splice(index, 1);
  res.json(removida);
});

const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`✅  Servidor rodando na porta ${PORT}`));
