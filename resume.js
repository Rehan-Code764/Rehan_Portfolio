(function () {
  var button = document.getElementById('dl');
  var note = document.getElementById('dlnote');

  button.addEventListener('click', function () {
    var link = document.createElement('a');
    link.href = 'assets/Rehan_Ansari_Resume.pdf';
    link.download = 'Rehan_Ansari_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    note.textContent = 'Resume download started.';
  });
})();
