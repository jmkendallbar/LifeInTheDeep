- [[#**Guiding questions:**|**Guiding questions:**]]
- [[#Overall app structure|Overall app structure]]
	- [[#**Guiding questions:**#Default branch|Default branch]]
	- [[#**Guiding questions:**#Current prototype|Current prototype]]
	- [[#**Guiding questions:**#Other branches|Other branches]]
- [[#Overall app structure#Feature description|Feature description]]

Hosting: currently local; unhosted

main challenges:
- data volume
- camera movement 

discord preferred to ask clarifying questions
### **Guiding questions:**
- buffering and removing data is in `debug-buffer` (not in `beta`)
- where is the model stored? 
	- s3: `loader.load("https://visualising-life-in-the-deep.s3.amazonaws.com/Seal_Animation.glb",`
- where is the data stored?
	- currently: locally
	- API in progress
- how/where can I switch out the model?
	- change `loader.load("https://visualising-life-in-the-deep.s3.amazonaws.com/Seal_Animation.glb",`
	- this code determines the animations that are called in:
		- this code transitions animation actions: `prepareCrossFade(idleAction, glideAction, 1.0);`
```
// once the model is loaded then we are picking the animations from the model like idle, gliding and swimming. 6, 28 and 15 is the index for that animation

      idleAction = mixer.clipAction(animations[6]);

      glideAction = mixer.clipAction(animations[28]);

      swimAction = mixer.clipAction(animations[15]);
```
- how to change animation behavior
	- change currentStatus() in main
- how/where can I change the appearance of the track?
	- around line 699 in main: `THREE.LineCurve3` and `THREE.Vector3`

```
new THREE.LineCurve3(

              new THREE.Vector3(

                Number(marineLifeBehaviourData[index].x),

                Number(marineLifeBehaviourData[index].y),

                Number(marineLifeBehaviourData[index].z)

              ),

              new THREE.Vector3(

                Number(marineLifeBehaviourData[index + 1].x),

                Number(marineLifeBehaviourData[index + 1].y),

                Number(marineLifeBehaviourData[index + 1].z)

              )
```
- how/where can I change the rotation of the animal?
	- in `moveGeometryToCoordinates.js`

```
model.rotation.x = Number(marineLifeBehaviourData[j].pitch);

    model.rotation.z = Number(marineLifeBehaviourData[j].roll);

    model.rotation.y = Number(marineLifeBehaviourData[j].heading);
```

- how/where can I change the color map for each behavioral state?
	- affects line color of track: ~line 733: `const stateColors = [0x535f97, 0x368c87, 0xe9bc65, 0x83bd56, 0x4787b9];`
- add or remove a new text counter?
1) use `appendElement.js` and style in `elementStyle.js`
2) define value to be rendered as text in `main.js`: 
   ` minuteInnerText.innerText = `${currentState.Seconds.toString().toHHMMSS()}`;`
- get arrows to point in x y z directions: `function arrow(axes)` in `main.js`
- how to adjust the appearance of the plane/surface?
	- go to `gridHelper` lines in `main.js`
```
gridHelper = new THREE.GridHelper(1000, 500);

      gridHelper.rotation.x = 0.04;

      gridHelper.rotation.y = 0;

      gridHelper.rotation.z = 0;

      gridHelper.position.set(0, 0, 0);

      const gridLod = new THREE.LOD();

      gridLod.addLevel(gridHelper, 20);

      scene.add(gridLod);
```
## Overall app structure

#### Default branch
`main` - currently nothing (just README.md and some files from [[Jessica Kendall-Bar]])
#### Current prototype
`beta` - current prototype (with rotations, track, plots, etc.)
- ##### Code structure in `beta`
	- 📁`Data` - old data folder
		- `Minimized_data.json` - was used during demo
	- 📁`gltf` - holds .glb file of animation stored in an s3 bucket (file itself not used here; just using link to cloud version)
	- 📁`models` - in future, could hold additional models
	- 📁`node_modules` - contains node modules 
	- 📁`seal_info`  - data that is currently being used
		- `batch_x` - each data file is 2000 records; 206 records
		- derived from `csvToJson.js`
			- uses CSV that needs to be added to `data` folder (too big for GitHub)
	- 📁`Sounds` - has heartbeat sounds that can be played back according to data
#### Other branches
`prod` - main parent branch- waiting for beta in future

`Spectrogram` - in progress, uses D3.js, in progress not merged 

API related (in order of recent-ness)
1) `debug-buffer` - has fix for api-integration lag; does (not?) have 2D chart at top () and crop button on bottom (relies on start time and end time)
	1) Ideally, you would have 3 arguments passed to the API call in addition to page; SealID, limit (# of records you want)
2) `api-integration` - debug buffer; not merged into beta - need additional .zip file from [[Abhishek Gupta]] that will contain the node project

Merged into beta
`lazyLoading` - R&D regarding track loading; not needed anymore; useful parts merged into beta
`track` - track implementation: merged into beta
`buffer` - will delete (meaningless)
`bugs` - bug fixes; merged into beta
`plotly` - graph implementation; merged into beta
`rolling` - implementation of pitch roll and heading; merged into beta
`ui-design` - used to beautify the UI; merged into beta
### Feature description

- ##### Feature: `Data-Driven Animation`
	- **Branch(es):** `beta`
	- **Script:** `main.js`
	- **Keyword to search:** `xyz`
	- **Status:** Revisit
	- **Notes**: Goes from stroking to gliding (threshold of 15 spm) but doesn't vary speed based on stroke rate
- ##### Feature: `Pitch, roll, heading`
	- **Branch(es):** `beta` & `rolling`
	- **Script:** `moveGeometryToCoordinates.js`
	- **Keyword to search:** `model.rotation.x`
	- **Status:** Revisit
	- **Notes**: Rotations are not applied in correct order here but work in rolling
- ##### Feature: `API integration`
	- **Branch(es):** `main` & `API-integration`
	- **Script:** `fetchDataFromAPI.js`
	- **Keyword to search:** `model.rotation.x`
	- **Status:** Revisit
	- **Notes**: Uses page is and perPage is skip


| Feature               | Branch(es)| Script or name in code  | Status  | Notes |
| --------------------- | ----------- | -------  | ------- | ------- |
| Data-Driven Animation | `beta`       | `main.js?` | Revisit | stroking v gliding |
| Pitch, roll, & heading| `beta` & `rolling` | `moveGeom...js` | Revisit | Rotations are not applied in correct order here but work in rolling |
| 2D plot at top        | 