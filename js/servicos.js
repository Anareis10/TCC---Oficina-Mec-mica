// Seleciona o elemento do card
const card = document.getElementById('flipcard');

// Quando o mouse passa por cima, adiciona a classe que gira o card
card.addEventListener('mouseenter', () => {
  card.classList.add('flipped');
});

// Quando o mouse sai de cima, remove a classe e o card volta ao normal
card.addEventListener('mouseleave', () => {
  card.classList.remove('flipped');
});