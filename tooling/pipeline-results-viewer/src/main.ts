import initSqlJs, { type Database, type SqlValue } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import "./style.scss";

const DB_URL = "/biergarten.sqlite";

const tabs = document.querySelectorAll<HTMLButtonElement>("[role='tab']");
const panels = document.querySelectorAll<HTMLDivElement>("[role='tabpanel']");

const tableSelect = document.querySelector<HTMLSelectElement>("#table-select")!;
const tableContainer =
  document.querySelector<HTMLDivElement>("#table-container")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;

const queryInput = document.querySelector<HTMLTextAreaElement>("#query-input")!;
const queryRun = document.querySelector<HTMLButtonElement>("#query-run")!;
const queryStatus = document.querySelector<HTMLParagraphElement>("#query-status")!;
const queryContainer =
  document.querySelector<HTMLDivElement>("#query-container")!;

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const otherTab of tabs) {
      const isActive = otherTab === tab;
      otherTab.classList.toggle("is-active", isActive);
      otherTab.setAttribute("aria-selected", String(isActive));
    }
    for (const panel of panels) {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    }
  });
}

const renderResultTable = (
  container: HTMLDivElement,
  columns: string[],
  values: SqlValue[][],
) => {
  const table = document.createElement("table");

  const head = table.createTHead().insertRow();
  for (const column of columns) {
    const th = document.createElement("th");
    th.textContent = column;
    head.append(th);
  }

  const body = table.createTBody();
  for (const row of values) {
    const tr = body.insertRow();
    for (const cell of row) {
      const td = document.createElement("td");
      td.textContent = String(cell ?? "");
      tr.append(td);
    }
  }

  container.append(table);
};

const renderTable = (db: Database, name: string) => {
  const result = db.exec(`SELECT * FROM "${name}"`);
  tableContainer.replaceChildren();

  if (result.length === 0) {
    tableContainer.append(
      Object.assign(document.createElement("p"), { textContent: "No rows." }),
    );
    return;
  }

  const { columns, values } = result[0];
  renderResultTable(tableContainer, columns, values);
};

const runQuery = (db: Database) => {
  const sql = queryInput.value.trim();
  queryContainer.replaceChildren();

  if (!sql) {
    queryStatus.textContent = "Enter a query to run.";
    return;
  }

  try {
    const results = db.exec(sql);

    if (results.length === 0) {
      queryStatus.textContent = "Query executed. No rows returned.";
      return;
    }

    const { columns, values } = results[results.length - 1];
    renderResultTable(queryContainer, columns, values);
    queryStatus.textContent = `${values.length} row${values.length === 1 ? "" : "s"} returned.`;
  } catch (error) {
    queryStatus.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

async function main(): Promise<void> {
  status.textContent = "Loading database...";

  const sqlJs = await initSqlJs({ locateFile: () => sqlWasmUrl });
  const response = await fetch(DB_URL);
  const buffer = await response.arrayBuffer();
  const db = new sqlJs.Database(new Uint8Array(buffer));

  const tables =
    db
      .exec(
        `SELECT name
         FROM sqlite_master
         WHERE
          type = 'table'
         AND
          name NOT LIKE 'sqlite_%'
         ORDER BY name`,
      )[0]
      ?.values.map((row) => String(row[0])) ?? [];

  for (const name of tables) {
    tableSelect.append(new Option(name, name));
  }

  tableSelect.addEventListener("change", () =>
    renderTable(db, tableSelect.value),
  );

  if (tables.length > 0) {
    renderTable(db, tables[0]);
  }

  status.textContent = "";

  queryRun.addEventListener("click", () => runQuery(db));
  queryInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      runQuery(db);
    }
  });
}

main().catch((error: unknown) => {
  status.textContent = `Failed to load database: ${String(error)}`;
});
