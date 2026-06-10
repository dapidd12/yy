import { getAccessToken } from './auth';

const STORAGE_KEY = 'moneymind_spreadsheet_id';

const now = Date.now();
const day = 86400000;

const DUMMY_ACCOUNTS = [
  { id: "1", name: "Bank BCA", type: "bank", balance: 12450000 },
  { id: "2", name: "GoPay", type: "ewallet", balance: 4200000 },
  { id: "3", name: "Dompet Utama", type: "cash", balance: 2500000 }
];

const DUMMY_TRANSACTIONS = [
  { id: "1", date: new Date(now).toISOString(), accountId: "1", type: "income", category: "Pekerjaan", amount: 12000000, description: "Gaji Bulanan" },
  { id: "2", date: new Date(now - day).toISOString(), accountId: "3", type: "expense", category: "Makan & Minum", amount: 45000, description: "Makan Siang" },
  { id: "3", date: new Date(now - day * 2).toISOString(), accountId: "1", type: "expense", category: "Kebutuhan", amount: 1200000, description: "Belanja Bulanan" },
  { id: "4", date: new Date(now - day * 3).toISOString(), accountId: "2", type: "expense", category: "Utilitas", amount: 450000, description: "Tagihan Listrik" },
];

export async function getSpreadsheetId(): Promise<string> {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = await createSpreadsheet();
    localStorage.setItem(STORAGE_KEY, id);
    await initSpreadsheet(id);
  }
  return id;
}

export async function createSpreadsheet(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("No access token");

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'MoneyMind Database',
      },
      sheets: [
        {
          properties: { title: 'Transactions' }
        },
        {
          properties: { title: 'Accounts' }
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Failed to create spreadsheet: ${err.error?.message}`);
  }

  const data = await response.json();
  return data.spreadsheetId;
}

export async function initSpreadsheet(spreadsheetId: string) {
  const token = await getAccessToken();
  
  // Set up headers
  const requests = [
    {
      updateCells: {
        range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: 'id' } },
              { userEnteredValue: { stringValue: 'date' } },
              { userEnteredValue: { stringValue: 'accountId' } },
              { userEnteredValue: { stringValue: 'type' } }, // income, expense, transfer
              { userEnteredValue: { stringValue: 'category' } },
              { userEnteredValue: { stringValue: 'amount' } },
              { userEnteredValue: { stringValue: 'description' } },
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    },
    {
      updateCells: {
        range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1 },
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: 'id' } },
              { userEnteredValue: { stringValue: 'name' } },
              { userEnteredValue: { stringValue: 'type' } }, // bank, ewallet, cash
              { userEnteredValue: { stringValue: 'balance' } },
            ]
          }
        ],
        fields: 'userEnteredValue'
      }
    }
  ];

  // We need the actual sheet IDs since 0 and 1 are just suggestions. By default 1st sheet is 0 usually, but creating multiple might give different IDs.
  // Actually, we can just use `values.update` for range `Transactions!A1:G1` and `Accounts!A1:D1` which is much easier!
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A1:G1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: [['id', 'date', 'accountId', 'type', 'category', 'amount', 'description']]
    })
  });

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Accounts!A1:D1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: [['id', 'name', 'type', 'balance']]
    })
  });
}

export async function getTransactions() {
  const token = await getAccessToken();
  if (!token) return DUMMY_TRANSACTIONS;
  const spreadsheetId = await getSpreadsheetId();
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A2:G`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.values) return [];
  
  return data.values.map((row: string[]) => ({
    id: row[0],
    date: row[1],
    accountId: row[2],
    type: row[3],
    category: row[4],
    amount: parseFloat(row[5]),
    description: row[6] || ''
  }));
}

export async function addTransaction(transaction: any) {
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  const spreadsheetId = await getSpreadsheetId();
  
  const values = [[
    transaction.id,
    transaction.date,
    transaction.accountId,
    transaction.type,
    transaction.category,
    transaction.amount.toString(),
    transaction.description || ''
  ]];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A:G:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to add tx:", text);
    throw new Error("Failed to add transaction");
  }
}

export async function deleteTransactions() {
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  const spreadsheetId = await getSpreadsheetId();
  // Simply clear from A2:G
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A2:G:clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getAccounts() {
  const token = await getAccessToken();
  if (!token) return DUMMY_ACCOUNTS;
  const spreadsheetId = await getSpreadsheetId();
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Accounts!A2:D`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.values) return [];
  
  return data.values.map((row: string[]) => ({
    id: row[0],
    name: row[1],
    type: row[2],
    balance: parseFloat(row[3])
  }));
}

export async function addAccount(account: any) {
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  const spreadsheetId = await getSpreadsheetId();
  
  const values = [[
    account.id,
    account.name,
    account.type,
    account.balance.toString()
  ]];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Accounts!A:D:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });

  if (!res.ok) throw new Error("Failed to add account");
}

export async function resetAccounts() {
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  const spreadsheetId = await getSpreadsheetId();
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Accounts!A2:D:clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  const spreadsheetId = await getSpreadsheetId();
  
  // To update a specific row, we find its index first:
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Accounts!A:D`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.values) return;
  
  const rowIndex = data.values.findIndex((row: string[]) => row[0] === accountId);
  if (rowIndex === -1) return;
  
  // Row in A1 notation is index + 1
  const rowNumber = rowIndex + 1;
  const updateRange = `Accounts!D${rowNumber}`;
  
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [[newBalance.toString()]] })
  });
}

export async function deleteAccount(accountId: string) {
  // Rather than shifting rows which needs sheet IDs, we can just clear the row or rewrite everything
  const spreadsheetId = await getSpreadsheetId();
  // Get all accounts
  const accounts = await getAccounts();
  const remaining = accounts.filter((a: any) => a.id !== accountId);
  
  await resetAccounts();
  
  for (const acc of remaining) {
    await addAccount(acc);
  }
}

export async function deleteTransaction(txId: string) {
  const spreadsheetId = await getSpreadsheetId();
  const txs = await getTransactions();
  const remaining = txs.filter((tx: any) => tx.id !== txId);
  
  await deleteTransactions();
  
  for (const tx of remaining) {
    await addTransaction(tx);
  }
}
