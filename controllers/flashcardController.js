const flashcardModel = require("../models/flashcards");
const setModel = require("../models/sets");
const cardModel = require("../models/flashcards");
const { spawn } = require("child_process");
const fs = require("fs");
const { JSDOM } = require("jsdom");

var url = require("url");

exports.index = (req, res, next) => {
  setModel
    .find()
    .populate("creator")
    .then((sets) => {
      let query = (req.query.search || "").toLowerCase();

      // Filter sets based on search query
      sets = sets.filter((set) => {
        const name = set.name ? set.name.toLowerCase() : "";
        const instructor = set.instructor ? set.instructor.toLowerCase() : "";
        const course = set.course ? set.course.toLowerCase() : "";

        return (
          name.includes(query) ||
          instructor.includes(query) ||
          course.includes(query)
        );
      });

      res.render("./flashcards/sets", { sets });
    })
    .catch((err) => next(err));
};

exports.cards = (req, res) => {
  res.render("./flashcards/flashcards");
};

exports.new = (req, res) => {
  console.log("wtf");
  res.render("./flashcards/new");
};

exports.createSet = (req, res, next) => {
  let set = new setModel(req.body);
  let setId = set._id;
  set.creator = req.session.user._id;
  console.log("set id: " + setId);
  console.log(set);
  set
    .save()
    .then(res.render("./flashcards/newCard", { setId }))
    .catch((err) => next(err));
};

exports.editSet = (req, res, next) => {
  let id = req.params.id;
  setModel.findById(id).then((set) => {
    if (!set) {
      let err = new error("Could not find set with id: " + id);
      err.status = 404;
      return next(err);
    }
    res.render("./flashcards/editSet", { set });
  });
};

exports.updateSet = (req, res, next) => {
  let set = req.body;
  let id = req.params.id;

  setModel
    .findByIdAndUpdate(id, set)
    .then((r) => {
      res.redirect("/flashcards/sets/" + id);
    })
    .catch((err) => next(err));
};

exports.editCard = (req, res, next) => {
  let id = req.params.id;
  flashcardModel.findById(id).then((card) => {
    if (!card) {
      let err = new Error("Could not find set with id: " + id);
      err.status = 404;
      return next(err);
    }
    res.render("./flashcards/editCard", { card });
  });
};

exports.updateCard = (req, res, next) => {
  let card = req.body;
  let id = req.params.id;
  flashcardModel
    .findByIdAndUpdate(id, card)
    .then((r) => {
      res.redirect("/flashcards/sets/" + r.setId);
    })
    .catch((err) => next(err));
};

exports.createCard = (req, res, next) => {
  let card = new cardModel(req.body);
  let setId = card.setId;
  console.log(card);
  card
    .save()
    .then(res.render("./flashcards/newCard", { setId }))
    .catch((err) => next(err));
};

exports.createSingleCard = (req, res, next) => {
  let card = new cardModel(req.body);
  card.setId = req.params.id;
  card.save();
  res.redirect("/flashcards/sets/" + req.params.id);
};
exports.getNewSingleCard = (req, res, nest) => {
  setModel.findById(req.params.id).then((set) => {
    res.render("flashcards/newSingleCard", { set });
  });
};

exports.set = (req, res, next) => {
  const url = req.url;
  const arr = url.split("/");
  const setId = arr[arr.length - 1];

  cardModel
    .find({ setId: setId })
    .then((cards) => {
      res.render("./flashcards/flashcards", { cards });
    })
    .catch((err) => next(err));
};

exports.showSetQs = (req, res, next) => {
  let id = req.params.id;
  setModel
    .findById(id)
    .then((set) => {
      if (!set) {
        let err = new Error("Cannot find set with id: " + id);
        err.status = 404;
        return next(err);
      }
      flashcardModel
        .find({ setId: id })
        .then((flashcardss) => {
          res.render("./flashcards/QAs", { set, flashcardss });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.deleteSet = (req, res, next) => {
  let id = req.params.id;
  setModel
    .findByIdAndDelete(id)
    .then((deltedSet) => {
      flashcardModel
        .deleteMany({ setId: id })
        .then((cards) => {
          res.redirect("/user/profile");
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.deleteCard = (req, res, next) => {
  let id = req.params.id;
  flashcardModel
    .findByIdAndDelete(id)
    .then((delCard) => {
      res.redirect("/flashcards/sets/" + delCard.setId);
    })
    .catch((err) => next(err));
};

exports.runPython = async (req, res, next) => {
  // const { username, password, url } = req.body;
  const pythonProcess = spawn("python3", [
    "./canvas_program.py",
    // username,
    // password,
    // url,
  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error("Error:", data.toString());
  });

  pythonProcess.on("close", async (code) => {
    console.log("Process exited with code", code);

    try {
      let set = await makeCards();
      set.creator = req.session.user;
      await set.save();
      let setName = set.name;

      // Render the page here
      cardModel
        .find({ setId: set.id })
        .then((cards) => {
          res.render("./flashcards/flashcards", { setName, cards });
        })
        .catch((err) => next(err));
    } catch (err) {
      if (!res.headersSent) {
        console.log("Error: " + err)
        res.status(500).send("Python script completed with an error." + err);
      } else {
        console.error("Error:", err);
      }
    }
  });

  // const pythonProcess = spawn('python3', ['-c', 'import sys; print(sys.executable)']);

  // pythonProcess.stdout.on('data', (data) => {
  //     console.log(`Python executable path: ${data.toString()}`);
  // });

  // pythonProcess.stderr.on('data', (data) => {
  //     console.error(`Error: ${data.toString()}`);
  // });

  // pythonProcess.on('close', (code) => {
  //     console.log('Process exited with code', code);
  // });
};

function makeCards() {
  let set = new setModel();

  // Load the HTML file
  const htmlContent = fs.readFileSync("output_page.html", "utf8");
  const dom = new JSDOM(htmlContent);

  // Use the window object from jsdom to simulate the browser's DOM
  const { document } = dom.window;

  var mobileHeader = document.querySelector("a.mobile-header-title");

  // Assuming there are exactly two <div> elements inside the <a> element
  var divs = mobileHeader.querySelectorAll("div");

  // Check if there are at least two divs
  if (divs.length >= 2) {
    // Store the text content of each div in separate variables
    set.course = divs[0].textContent.trim();
    set.name = divs[1].textContent.trim();
  }

  set.instructor = "tbd";
  let setId;
  setId = set._id;

  // Create an array to hold the titles of divs with the class "correct_answer"
  var correctAnswerTitles = [];

  // Select all div elements with the class "correct_answer"
  var divsWithCorrectAnswer = document.querySelectorAll("div.correct_answer");

  // Loop through each element and get the title attribute
  divsWithCorrectAnswer.forEach(function (div) {
    var title = div.getAttribute("title"); // Get the title attribute
    if (title) {
      // Check if the title attribute is not empty
      correctAnswerTitles.push(title); // Add the title to the array
    }
  });



  let questionTexts = [];

  //Gets question text
  console.log('try statement');
  try {
    questionTexts = [...document.querySelectorAll('textarea.textarea_question_text[name="question_text"]')]
        .map(textarea => textarea.value.replace(/<[^>]*>/g, '').trim());

    // if (questionTexts.length === 0) {
    //     console.log("using p");
    //     questionTexts = [...document.querySelectorAll('div.question_text span')]
    //         .map(span => span.innerText.replace(/<[^>]*>/g, '').trim());
    // }

    
} catch (error) {
    console.error("An error occurred while extracting text:", error);
}


  for (let i = 0; i < correctAnswerTitles.length; i++) {
    let card = new cardModel();
    card.answer = correctAnswerTitles[i];
    card.question = questionTexts[i];
    card.setId = setId;
    if(card.answer && card.question && card.setId){
      card.save();
    } else {
      console.log("incomplete card: " + card) 
    }
    
  }
  return set;
}
