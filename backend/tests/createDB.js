let cdb;
try{
    cdb = require("./databaseCreator");
}
catch(err){
    try{
        cdb = require("./tests/databaseCreator");
    }
    catch(err){

    }
}

async function main(){
    await cdb.dropDatabase();
    await cdb.createDatabase();
    await cdb.createTables();
    // await cdb.insertData();
}

main();