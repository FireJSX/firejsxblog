const textContainer = document.querySelector('#text-container span');
const texts = ["Welcome to my website", "Regards, Jonas 'FireJSX' Vogel"];  // Die Texte, die getippt werden sollen
let currentTextIndex = 0;
let currentLetterIndex = 0;

function typeText() {
    const currentText = texts[currentTextIndex];
    const currentLetter = currentText[currentLetterIndex];
    textContainer.textContent += currentLetter;

    currentLetterIndex++;

    if (currentLetterIndex < currentText.length) {
        setTimeout(typeText, 100);  // 100ms Verzögerung für das nächste Zeichen
    } else {
        setTimeout(resetText, 1000);  // 1 Sekunde warten, bevor der Text zurückgesetzt wird
    }
}

function resetText() {
    currentLetterIndex = 0;
    textContainer.textContent = '';  // Löscht den Text
    currentTextIndex++;

    if (currentTextIndex >= texts.length) {
        currentTextIndex = 0;  // Wenn alle Texte durch sind, von vorne beginnen
    }

    setTimeout(typeText, 1000);
}

typeText();