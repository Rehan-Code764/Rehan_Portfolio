(function(){
  var buttons = document.querySelectorAll('.filter-btn');
  var projects = Array.from(document.querySelectorAll('#project-list li'));
  var status = document.getElementById('project-status');
  if (!buttons.length || !projects.length || !status) return;

  buttons.forEach(function(button){
    button.addEventListener('click', function(){
      var filter = button.dataset.filter;
      var visibleCount = 0;

      buttons.forEach(function(item){
        var selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      projects.forEach(function(project){
        var visible = filter === 'all' || project.dataset.category === filter;
        project.hidden = !visible;
        if (visible) visibleCount++;
      });

      status.textContent = filter === 'all'
        ? 'Showing all ' + visibleCount + ' projects'
        : 'Showing ' + visibleCount + ' ' + button.textContent.trim() + ' project' + (visibleCount === 1 ? '' : 's');
    });
  });
})();
