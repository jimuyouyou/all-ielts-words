import PouchDB from 'pouchdb';

const db = new PouchDB('http://root:123456@localhost:5984/kittens');

export async function getAll() {
  try {
    const res = await db.allDocs({
      include_docs: true,
      attachments: true
    });

    return res.rows.map(it => it.doc);
  } catch (e) {
    console.log('getAll failed: ', e);
    return [];
  }
}

export async function upsert(doc) {
  try {
    await db.put(doc, { force: true });
  } catch (e) {
    console.log('upsert failed: ', e);
  }
}

export async function remove(doc) {
  try {
    const dbDoc = await db.get(doc._id);
    if (dbDoc) await db.remove(dbDoc);
  } catch (e) {
    console.log('remove failed: ', e);
  }
}