import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE test (info TEXT)");
    db.run("INSERT INTO test VALUES (?)", ["Works"]);
    db.get("SELECT info FROM test", (err, row) => {
        if (err) console.error(err);
        else console.log("SQLite Test:", row.info);
    });
});
