const dataInput = document.getElementById("data");
const horaInput = document.getElementById("horario");

dataInput.addEventListener("click", () => {
    dataInput.showPicker();
});

horaInput.addEventListener("click", () => {
    horaInput.showPicker();
});