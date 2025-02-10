
let currentIndex = 0;
let cards;

document.addEventListener('DOMContentLoaded', function () {
    updateCard();
    console.log('hello');  // Initial display of card;
    var cards = JSON.stringify(cards);
  });

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');       

}

function next() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCard();
}

function back(){
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCard();
}

function updateCard() {
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const flashcard = document.getElementById('flashcard');
    const showAnswerCheckbox = document.getElementById('showAnswerCheckbox');
    
    
    if (currentIndex < cards.length) {
        if (showAnswerCheckbox.checked && flashcard.classList.contains('flipped') || (!showAnswerCheckbox.checked && !flashcard.classList.contains('flipped'))) {
            questionElement.textContent = cards[currentIndex].question;
            answerElement.textContent = cards[currentIndex].answer;
        } else if (showAnswerCheckbox.checked){
            answerElement.textContent = cards[currentIndex].answer;
            flipCard();
            flashcard.addEventListener('transitionend', () => {
                questionElement.textContent = cards[currentIndex].question;                
            });
        }else{
            questionElement.textContent = cards[currentIndex].question;
            flipCard();
            flashcard.addEventListener('transitionend', () => {
                answerElement.textContent = cards[currentIndex].answer;                
            });
            
            
        }
    }
}


