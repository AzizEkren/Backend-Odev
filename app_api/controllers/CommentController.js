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
        const venue = await Venue.findById(req.params.venueid).select("comments");
        if (!venue) {
            return createResponse(res, 404, { message: "Venue not found" });
        }
        createComment(req, res, venue);
    } catch (error) {
        console.error("Error in addComment:", error);
        createResponse(res, 400, error);
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
  

  const getComment = async function (req, res) {
    try {
      await Venue.findById(req.params.venueid)
        .select("name comments")
        .exec()
        .then(function (venue) {
          var response, comment;
          if (!venue) {
            createResponse(res, "404", "Mekanid yanlış");
          } else if (venue.comments.id(req.params.commentid)) {
            comment = venue.comments.id(req.params.commentid);
            response = {
              venue: {
                name: venue.name,
                id: req.params.id,
              },
              comment: comment,
            };
            createResponse(res, "200", response);
          } else {
            createResponse(res, "404", "Yorum id yanlış");
          }
        });
    } catch (error) {
      createResponse(res, "404", "Mekan bulunamadı");
    }
  };
  


  const updateComment = async function (req, res) {
    try {
        const venue = await Venue.findById(req.params.venueid).select("comments").exec();
        if (!venue) {
            return createResponse(res, "400", "Venue not found");
        }

        const comment = venue.comments.id(req.params.commentid);
        if (!comment) {
            return createResponse(res, "400", "Comment not found");
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return createResponse(res, "400", "Request body is empty or invalid");
        }

        comment.set(req.body);

        await venue.save();
        updateRating(venue.id, false);
        createResponse(res, "201", comment);
    } catch (error) {
        console.error("Error updating comment:", error); // Loglama
        createResponse(res, "400", error.message || "Unknown error");
    }
};



module.exports={
    getComment,
    addComment,
    updateComment,
    deleteComment,
    createComment
}