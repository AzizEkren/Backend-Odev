var mongoose=require('mongoose');
//Cloud mongodb için aşağıdaki adresi cloud adresiyle değiştirin.
var dbURI="mongodb+srv://azizekren:CEAzizekren2116.@cluster0.zzv6z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(dbURI);
mongoose.connection.on("connected",function(){
    console.log(dbURI+" adresine bağlandı");
});
mongoose.connection.on("disconnected",function(){
    console.log(dbURI+" bağlantısı koptu");
});

process.on("SIGINT",function(){
    mongoose.connection.close();
    console.log("Bağlantı kapatıldı");
    process.exit(0);
});
require("./venue");