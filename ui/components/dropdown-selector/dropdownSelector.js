import { init, setSelectedSceneName } from '../../../main';

export default function renderDropdownElement({ options, elementId, onOptionSelected, onDropdownOpened }) {
	const dropdownContainerElement = document.getElementById(elementId);
	if (!dropdownContainerElement) {
		console.error(`Button with id ${elementId} not found.`);
		return;
	}
	
	// Add click listener to toggle options list
	dropdownContainerElement.addEventListener('click', () => {
		const list = document.querySelector('.dropdown-list'); // Selects the first .dropdown-list element
		if (!list) {
			console.error('Dropdown list element not found.');
			return;
		}
		list.style.display = list.style.display === 'none' ? 'block' : 'none';
	});
	
	const list = document.querySelector('.dropdown-list'); // Selects the first .dropdown-list element
	if (!list) {
		console.error('Dropdown list element not found.');
		return;
	}
	
	list.innerHTML = ''; // Clear existing options
	
	options.forEach((option, index) => {
		const listItem = document.createElement('li');
		listItem.className = 'text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9';
		listItem.id = `listbox-option-${index}`;
		listItem.role = 'option';
		
		const textSpan = document.createElement('span');
		textSpan.className = 'font-normal block truncate';
		textSpan.textContent = option;
		
		// Optionally, add a click event listener to each list item
		listItem.addEventListener('click', () => {
			// Update the display element with the selected option
			const displayElement = dropdownContainerElement.querySelector('.block.truncate');
			if (displayElement) {
				displayElement.textContent = option;
				
				setSelectedSceneName(option);
				// Reload the scene/page
				window.location.reload();
			}
			// Close the dropdown list when an option is selected
			list.style.display = 'none';
		});
		
		listItem.appendChild(textSpan);
		list.appendChild(listItem);
	});
	
	// Optional: Add event listener to open the dropdown when the button is clicked
	// dropdownContainerElement.addEventListener('click', () => {
	// 	list.style.display = list.style.display === 'none' ? 'block' : 'none';
	// });
}
