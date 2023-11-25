import {
  strokeEle,
  strokeInnerText,
  heartEle,
  heartInnerText,
  rangeSlider,
  minuteEle,
  depthEle,
  stateEle,
  playSpeedBtn,
  pauseBtn,
  playBtn,
  resetBtn,
  cropBtn,
  depthInnerText,
  minuteInnerText,
  rollEle,
  rollInnerText,
  headInnerText,
  headEle,
  pitchEle,
  pitchInnerText,
} from "./main";

import renderDropdownElement from './ui/components/dropdown-selector/dropdownSelector';
import {sceneNames} from './main';


export default function addHTMLElementsToDOM() {
  document.body.appendChild(strokeEle);
  document.body.appendChild(strokeInnerText);
  document.body.appendChild(heartEle);
  document.body.appendChild(heartInnerText);
  document.body.appendChild(rangeSlider);
  document.body.appendChild(pauseBtn);
  document.body.appendChild(playBtn);
  document.body.appendChild(resetBtn);
  document.body.appendChild(minuteEle);
  document.body.appendChild(stateEle);
  document.body.appendChild(depthEle);
  document.body.appendChild(playSpeedBtn);
  document.body.appendChild(cropBtn);
  document.body.appendChild(depthInnerText);
  document.body.appendChild(minuteInnerText);
  document.body.appendChild(rollEle);
  document.body.appendChild(headEle);
  document.body.appendChild(pitchEle);
  document.body.appendChild(rollInnerText);
  document.body.appendChild(headInnerText);
  document.body.appendChild(pitchInnerText);
  
  _addTailwindComponentsToDOM();
}

export function loadComponent({componentFilePath, componentHtmlId}) {
  fetch(componentFilePath)
      .then(response => response.text())
      .then(html => {
        const container = document.getElementById(componentHtmlId);
        if (!container) {
          console.error('Container element not found:', componentHtmlId);
          return;
        }
        
        container.innerHTML = html; // Set the inner HTML of the container
        
        // Now that the HTML is set, call renderDropdownOptions to populate it
        renderDropdownElement({
          options: sceneNames,
          elementId: componentHtmlId, // Assuming this is the ID of the dropdown button or container
        });
        
        document.body.appendChild(container); // Append the container to the body
      })
      .catch(error => {
        console.error('Error loading the component:', error);
      });
}

function _addTailwindComponentsToDOM() {
  const tailwindComponents = [
    {
      componentFilePath: './ui/components/dropdown-selector/dropdownSelector.html',
      componentHtmlId: 'marine-life-dropdown-selector',
    }
  ];

  tailwindComponents.forEach(component => {
    loadComponent(component);
  });
}