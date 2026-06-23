import "95css/css/95css.css";
import "./style.css";
import initSqlJs, { type Database } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

const DB_URL = "/biergarten.sqlite";

const tableSelect = document.querySelector<HTMLSelectElement>("#table-select")!;
const tableContainer = document.querySelector<HTMLDivElement>("#table-container")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;

function renderTable(db: Database, name: string): void {
  const result = db.exec(`SELECT * FROM "${name}"`);
  tableContainer.replaceChildren();

  if (result.length === 0) {
    tableContainer.append(Object.assign(document.createElement("p"), { textContent: "No rows." }));
    return;
  }

  const { columns, values } = result[0];
  const table = document.createElement("table");

  const head = table.createTHead().insertRow();
  for (const column of columns) {
    head.append(Object.assign(document.createElement("th"), { textContent: column }));
  }

  const body = table.createTBody();
  for (const row of values) {
    const tr = body.insertRow();
    for (const cell of row) {
      tr.append(Object.assign(document.createElement("td"), { textContent: String(cell ?? "") }));
    }
  }

  tableContainer.append(table);
}

async function main(): Promise<void> {
  status.textContent = "Loading database...";

  const sqlJs = await initSqlJs({ locateFile: () => sqlWasmUrl });
  const response = await fetch(DB_URL);
  const buffer = await response.arrayBuffer();
  const db = new sqlJs.Database(new Uint8Array(buffer));

  const tables =
    db
      .exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]
      ?.values.map((row) => String(row[0])) ?? [];

  for (const name of tables) {
    tableSelect.append(new Option(name, name));
  }

  tableSelect.addEventListener("change", () => renderTable(db, tableSelect.value));

  if (tables.length > 0) {
    renderTable(db, tables[0]);
  }

  status.textContent = "";
}

main().catch((error: unknown) => {
  status.textContent = `Failed to load database: ${String(error)}`;
});
