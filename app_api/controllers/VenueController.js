var mongoose=require("mongoose");
var Venue=mongoose.model("venue");

const createResponse=function(res,status,content){
res.status(status).json(content);


}

const listVenues=function(req,res){
    createResponse(res,"200",{"status":"Success"});
}

const addVenue=async function(req,res){
    try{
        await Venue.create({
            ...req.body,
            coordinates:[req.body.lat,req.body.long],
            hours:[
                {
                    days:req.body.day1,
                    open:req.body.open1,
                    close:req.body.close1,
                    isClosed:req.body.isClosed1,
                },
                {
                    days:req.body.day2,
                    open:req.body.open2,
                    close:req.body.close2,
                    isClosed:req.body.isClosed2,
                },

            ],
        }).then(function(response){
            createResponse(res,201,response);
        });
    }
    catch(error){
       createResponse(res,"404",{"status":"Ekleme Başarısız"})
    }
}

const getVenue=function(req,res){
    createResponse(res,"200",{"status":"Success"});
}

const updateVenue = async function (req, res) {
    try {
        const updatedVenue = await Venue.findByIdAndUpdate(req.params.venueid, {
            ...req.body,
            coordinates: [req.body.lat, req.body.long],
            hours: [
                {
                    days: req.body.day1,
                    open: req.body.open1,
                    close: req.body.close1,
                    isClosed: req.body.isClosed1,
                },
                {
                    days: req.body.day2,
                    open: req.body.open2,
                    close: req.body.close2,
                    isClosed: req.body.isClosed2,
                },
            ],
        });
        createResponse(res, "201", updatedVenue);
    } catch (error) {
        createResponse(res, "400", { status: "Güncelleme başarısız." });
    }
};


const deleteVenue = async function (req, res) {
    try {
        await Venue.findByIdAndDelete(req.params.venueid).then(function (venue) {
            createResponse(res, 200, { status: venue.name + " isimli mekan silindi" });
        });
    } catch (error) {
        createResponse(res, 404, { status: "Böyle bir mekan yok!" });
    }
};


module.exports={
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
}