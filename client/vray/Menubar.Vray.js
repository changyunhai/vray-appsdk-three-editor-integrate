import { UIPanel, UIRow } from '../three/editor/js/libs/ui.js';
import { VrayService } from './vray.connect.js';



function MenubarVray(editor, service) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Vray');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// 

	let option = new UIRow();
	option.setClass('option');
	option.setTextContent('Start');
	option.onClick(function () {

		service.start();

	});
	options.add(option);


	// 

	option = new UIRow();
	option.setClass('option');
	option.setTextContent('End');
	option.onClick(function () {
		service.end();

	});
	options.add(option);

	// 

	option = new UIRow();
	option.setClass('option');
	option.setTextContent('Export');
	option.onClick(function () {
		alert("coming soon...")
	});
	//options.add(option);

	// 

	option = new UIRow();
	option.setClass('option');
	option.setTextContent("Settings...");
	option.onClick(function () {
		alert("setting")

	});
	//options.add(option);

	return container;

}

export { MenubarVray };
