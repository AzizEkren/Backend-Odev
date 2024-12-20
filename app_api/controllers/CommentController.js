var mongoose=require("mongoose");
var Venue=mongoose.model("venue");

const createResponse=function(res,status,content){
res.status(status).json(content);


}
var createComment = function (req, res, incomingVenue) {
    incomingVenue.comments.push(req.body)
    try {
        incomingVenue.save().then(function (venue) {
            var comments = venue.comments;
            var comment = venue.comments[comments.length - 1];
            updateRating(venue.id, false);
            createResponse(res, "201", comment);
        });
    } catch (error) {
        createResponse(res, "400", error);
    }
};
var updateRating=function(venueid,isDeleted){
    Venue.findById(venueid)
    .select("rating comments")
    .exec()
    .then(function(venue){
        calculateLastRating(venue,isDeleted);
    });
};
var calculateLastRating = function (incomingVenue, isDeleted) {
    var i,
        numComments,
        avgRating,
        sumRating = 0;

    var numComments = incomingVenue.comments.length;
    if (incomingVenue.comments) {
        if (incomingVenue.comments.length == 0 && isDeleted) {
            avgRating = 0;
        } else {
            for (i = 0; i < numComments; i++) {
                sumRating = sumRating + incomingVenue.comments[i].rating;
            }
            avgRating = Math.ceil(sumRating / numComments);
        }
    }
    incomingVenue.rating = avgRating;
    incomingVenue.save();
};


const addComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then((incomingVenue) => {
                createComment(req, res, incomingVenue);
            });
    } catch (error) {
        createResponse(res, 400,error)
    }
};


const deleteComment = async function (req, res) {
    try {
      await Venue.findById(req.params.venueid)
        .select('comments')
        .exec()
        .then(function (venue) {
          try {
            let comment = venue.comments.id(req.params.commentid);
            comment.deleteOne();
            venue.save().then(function () {
              updateRating(venue.id, true);
              createResponse(res, "200", `status: ${comment.author} isimli kişinin yorumu silindi`);
            });
          } catch (error) {
            createResponse(res, "400", error);
          }
        });
    } catch (error) {
      createResponse(res, "400", error);
    }
  };
  

const getComment=function(req,res){
    createResponse(res,"200",{"status":"Success"});
}

const updateComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then(function (venue) {
                try {
                    let comment = venue.comments.id(req.params.commentid);
                    comment.set(req.body);
                    venue.save().then(function () {
                        updateRating(venue.id, false);
                        createResponse(res, "201", comment);
                    });
                } catch (error) {
                    createResponse(res, "400", error);
                }
            });
    } catch (error) {
        createResponse(res, "400", error);
    }
};


module.exports={
    getComment,
    addComment,
    updateComment,
    deleteComment,
    createComment
}