var container = document.getElementById('area-dropdowns-container');

// addLoadEvent(generateAreaDropdowns);

addLoadEvent(generateAreaDropdowns);
// addLoadEvent(setInfoAreaSelectAndCheckboxStatus);


function generateAreaDropdowns() {
    // 生成四个下拉选择框和复选框
    for (var i = 0; i < 4; i++) {
        var area_name = ["LAM", "LA", "LVM", "LV"];
        // 创建新的下拉选择框元素
        var select = document.createElement('select');
        select.name = 'info_select_' + area_name[i];
        select.id = 'info_select_' + area_name[i];
        select.disabled = false;

        // 添加选项到下拉选择框
        for (var j = 0; j < area_name.length; j++) {
            var option = document.createElement('option');
            option.value = area_name[j];
            option.textContent = area_name[j];
			option.disabled = false;
            select.appendChild(option);
        }
		select.selectedIndex = i;

        // 创建新的复选框元素
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'info_checkbox_' + area_name[i];
        checkbox.id = 'info_checkbox_' + area_name[i];
		checkbox.disabled = false;
		checkbox.checked = !_polygonAreaPoints[area_name[i]]['checkbox'];

		//create delete button with class name "trash-button", and the value of button is icon of "fas fa-trash".
	// <button class="trash-button">
        // <i class="fas fa-trash"></i> <!-- Font Awesome 垃圾桶图标 -->
    // </button>
		var delete_button = document.createElement('button');
		// delete_button.type = 'button';
		delete_button.name = 'info_delete_' + area_name[i];
		delete_button.id = 'info_delete_' + area_name[i];
		delete_button.className = 'trash-button';
        // var icon = document.createElement('i');
		var icon = document.createElement('i');
		icon.className = "fas fa-trash";
		icon.id = 'info_delete_' + area_name[i];
		delete_button.appendChild(icon);




        // 创建一个换行元素
        var newLine = document.createElement('br');

        // 添加下拉选择框、复选框和换行元素到容器
        container.appendChild(checkbox);
        container.appendChild(select);
		container.appendChild(delete_button);
        container.appendChild(newLine);

        // 添加事件监听器到下拉选择框
        select.addEventListener('change', function(event) {
			saveRemind=true;
            // 在这里处理下拉选择框的选择更改事件
            var selectedValue = event.target.value;
            // console.log('选择框的值更改为: ' + selectedValue);
			// console.log('选择框的id为: ' + event.target.id);
			var area_name = event.target.id.split('_')[2];
			// console.log('选择框的name为: ' + area_name);
			_polygonAreaPoints[selectedValue]['points'] = _polygonAreaPoints[area_name]['points'];
			_polygonAreaPoints[selectedValue]['checkbox'] = _polygonAreaPoints[area_name]['checkbox'];
			_polygonAreaPoints[area_name]['points'] = [];
			_polygonAreaPoints[area_name]['checkbox'] = false;
			drawImage();
			// setInfoAreaSelectAndCheckboxStatus();
			event.target.value = area_name;
        });

		// 添加事件监听器到复选框
		checkbox.addEventListener('change', function(event) {
			// 在这里处理复选框的选择更改事件
			// var selectedValue = event.target.value;
			// console.log('选择框的值更改为: ' + selectedValue);
			// console.log('选择框的id为: ' + event.target.id);
			// console.log('选择框的checked为: ' + event.target.checked);
			// console.log('选择框的disabled为: ' + event.target.disabled);
			var area_name = event.target.id.split('_')[2];
			// console.log('选择框的name为: ' + area_name);
			// console.log('选择框的name为: ' + event.target.name);
			_polygonAreaPoints[area_name]['checkbox'] = event.target.checked;
			// setInfoAreaSelectAndCheckboxStatus();
			drawImage();

		});
		// 添加事件监听器到删除按钮
		delete_button.addEventListener('click', function(event) {
			saveRemind=true;
			var area_name = event.target.id.split('_')[2];
			_polygonAreaPoints[area_name]['points'] = [];
			_polygonAreaPoints[area_name]['checkbox'] = false;

			// console.log(event.target.id);
			console.log(area_name);
			drawImage();
		});

		
    }

}


function setInfoAreaSelectAndCheckboxStatus()
{
	// set option of select disabled owed to _polygonAreaPoints[area[i]][points] is not empty
	//
	var area = ['LAM', 'LA', 'LVM', 'LV'];


	for (var i = 0; i < area.length; i++) {
		if (_polygonAreaPoints[area[i]]['points'].length == 0) {
			// console.log('setInfoAreaSelectAndCheckboxStatus: ' + area[i] + ' is empty');
			document.getElementById('info_select_' + area[i]).disabled = true;
			document.getElementById('info_checkbox_' + area[i]).disabled = true;
			document.getElementById('info_delete_' + area[i]).disabled = true;

		}
		else {
			document.getElementById('info_select_' + area[i]).disabled = false;
			document.getElementById('info_checkbox_' + area[i]).disabled = false;
			document.getElementById('info_delete_' + area[i]).disabled = false;
		}
		for (var k = 0; k < area.length; k++) {
			if (_polygonAreaPoints[area[k]]['points'].length == 0) {
				// console.log('setInfoAreaSelectAndCheckboxStatus: ' + area[i] + ' is empty');
				// document.getElementById('info_select_' + area[i]).disabled = false;
				document.getElementById('info_select_' + area[i]).options[k].disabled = false;
				
			} else {
				// document.getElementById('info_select_' + area[i]).disabled = true;
				document.getElementById('info_select_' + area[i]).options[k].disabled = true;
			}
		}
	}


}


function showInfoAreaOption()
{
	var tmp = document.getElementById('info_area_LAM');
	console.log(tmp.id);
	console.log(tmp.options[0].value);
	tmp.options[3].disabled = true;
}
