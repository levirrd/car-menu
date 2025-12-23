/// <reference path="./.config/sa.d.ts" />
import "./.config/sa.enums.js";
import { KeyCode } from "./.config/sa.enums.js";
import { Font } from "./.config/enums.js";

// ===== Config =====
let menuTitle = "Car Menu";
let isCheatEnabled = false;
let carMenuEnabled = false;
let godModeState = false;
let isCarSpawnerMode  = false;
const player = new Player(0);
const playerChar = player.getChar();
const MIN_CAR_NUMBER = 400;
const MAX_CAR_NUMBER = 611;
// ===== Keybinds =====
const CHEATENABLEBIND = "CARMENU"; // cheat code
const MENUENABLEBIND = KeyCode.H; // open/close menu
const MENUSWITCHBIND = KeyCode.Tab; // switch between car utils and spawner
const IDUPBIND = KeyCode.Up; // increase vehicle ID
const IDDOWNBIND = KeyCode.Down; // decrease vehicle ID
const IDSPAWNBIND = KeyCode.N; // spawn vehicle
const CLOSMENUBIND = KeyCode.Back; // close menu
const GODMODEBIND = KeyCode.U; // godmode
const REPAIRBIND = KeyCode.K; // repair
const DESTROYBIND = KeyCode.J; // destroy
const FLIPBIND = KeyCode.L; // flip
let carNumber = MIN_CAR_NUMBER;

// ===== UI =====
export function drawCarUtils() {
    // Background box 
    Hud.DrawRect(550.0, 160.0, 220.0, 100.0, 0, 0, 0, 255);
    // ===== Car Utils TAB =====
    if(!isCarSpawnerMode){
        menuTitle = "Car Utils";
        Text.SetFont(Font.Menu);
        Text.SetScale(0.22, 0.85);
        Text.SetWrapX(660.0);
        Text.DisplayFormatted(
            445.0,
            135.0,
            "Car spawning TAB: ~b~TAB~w~");
        Text.SetFont(Font.Menu);
        Text.SetScale(0.22, 0.85);
        Text.SetWrapX(660.0);
        Text.DisplayFormatted(
            445.0,
            165.0,
            "Repair: ~y~K~w~ Flip: ~y~L~w~ Destroy: ~y~J~w~ Godmode: ~y~U~w~");

    }
    // ===== Car Spawner TAB =====
    else{
        menuTitle = "Car Spawner";
        Text.SetFont(Font.Menu);
        Text.SetScale(0.22, 0.85);
        Text.SetWrapX(660.0);
        Text.DisplayFormatted(
            445.0,
            135.0,
        "Car Utils TAB: ~b~TAB~w~");
        Text.SetFont(Font.Menu);
        Text.SetScale(0.22, 0.85);
        Text.SetWrapX(660.0);
        Text.DisplayFormatted(
            445.0,
            165.0,
            "Change ID: ~g~Arrows~w~ Spawn: ~g~N~w~");
            
    }
    Text.UseCommands(true);
    // ===== Title =====
    Text.SetFont(Font.Menu);
    Text.SetScale(0.32, 1.0);
    Text.SetWrapX(660.0);

    Text.DisplayFormatted(465.0, 110.0, "~b~" + menuTitle);
    // ===== Close menu SECTION =====
    Text.SetFont(Font.Menu);
    Text.SetScale(0.22, 0.85);
    Text.SetWrapX(660.0);
    Text.DisplayFormatted(
        445.0,
        195.0,
        "Close: ~r~H / Backspace~w~"
    );
}
// ===== Helpers =====
function setCarMenuEnabled(enabled) {
    carMenuEnabled = enabled;
}
function wrapNumber(num, min, max) {
    if (num > max) return min;
    if (num < min) return max;
    return num;
}
function addVec(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}
function spawnCar(carNum) {
    if(playerChar.isInAnyCar()){
        const currentCar = playerChar.getCarIsUsing();
        let playerCoords = playerChar.getCoordinates();
        playerChar.warpFromCarToCoord(playerCoords.x, playerCoords.y, playerCoords.z);
        currentCar.delete();
    }
    Streaming.RequestModel(carNum);
    while (!Streaming.HasModelLoaded(carNum)) {
        wait(0);
    }

    Streaming.LoadAllModelsNow();

    const pos = addVec(playerChar.getCoordinates(), { x: 2.0, y: -2.0, z: 0.0 });
    const heading = playerChar.getHeading();

    const car = Car.Create(carNum, pos.x, pos.y, pos.z);
    car.setHeading(heading);
    Task.WarpCharIntoCarAsDriver(playerChar, car);

    Streaming.MarkModelAsNoLongerNeeded(carNum);
}
// ===== Main Logic =====
while (true) {
    wait(0);
    // Enable/disable cheat
    if (Pad.TestCheat(CHEATENABLEBIND)) {
        isCheatEnabled = !isCheatEnabled;
        if (isCheatEnabled) {
            Text.PrintHelpFormatted("~g~CarMenu cheat enabled");
        } else {
            Text.PrintHelpFormatted("~r~CarMenu cheat disabled");
            setCarMenuEnabled(false);
        }
    }
    // Open/close menu
    if (Pad.IsKeyJustPressed(MENUENABLEBIND) && isCheatEnabled) {
        setCarMenuEnabled(!carMenuEnabled);;
    }
    if (!carMenuEnabled) continue;
    if (Pad.IsKeyJustPressed(MENUENABLEBIND)) {
        setCarMenuEnabled(true);
    }
    drawCarUtils();
        // Switch between car utils and car spawner
    if(Pad.IsKeyJustPressed(MENUSWITCHBIND) && carMenuEnabled) {
        isCarSpawnerMode = !isCarSpawnerMode;
        //playerChar.freezePosition(isCarSpawnerMode); 
        // use this if you want to freeze the player when in car spawner mode
        wait(200);
    }
    // Car Spawner functionality
    if(isCarSpawnerMode) Text.PrintFormattedNow("Selected vehicle ID: %d", 50, carNumber);
    if(isCarSpawnerMode && Pad.IsKeyJustPressed(IDUPBIND)) {
        carNumber = wrapNumber(carNumber + 1, MIN_CAR_NUMBER, MAX_CAR_NUMBER);
        wait(100);
    }
    if(isCarSpawnerMode && Pad.IsKeyJustPressed(IDDOWNBIND)) {
        carNumber = wrapNumber(carNumber - 1, MIN_CAR_NUMBER, MAX_CAR_NUMBER);
        wait(100);
    }
    if (Pad.IsKeyJustPressed(IDSPAWNBIND) && isCarSpawnerMode) {
        spawnCar(carNumber);
        wait(200);
    }
    if (Pad.IsKeyJustPressed(CLOSMENUBIND)) {
        setCarMenuEnabled(false);
        wait(200);
    }
    //godmode
    if (Pad.IsKeyJustPressed(GODMODEBIND) && !isCarSpawnerMode) {
        if (!playerChar.isInAnyCar()) {
            Text.PrintHelpFormatted("~r~Enter a vehicle first!");
            continue;
        }
        const car = playerChar.getCarIsUsing();
        godModeState = !godModeState;
    
        if (!godModeState) {
            car.setProofs(false, false, false, false, false);
            car.setCanBurstTires(true);
            car.setCanBeDamaged(true);
            Text.PrintHelpFormatted("~r~Vehicle godmode disabled");
        } else {
            car.setProofs(true, true, true, true, true);
            car.setCanBurstTires(false);
            car.setCanBeDamaged(false);
            Text.PrintHelpFormatted("~g~Vehicle godmode enabled");
        }
    }
    // repair
    if (Pad.IsKeyJustPressed(REPAIRBIND) && !isCarSpawnerMode) {
        if (!playerChar.isInAnyCar()) {
            Text.PrintHelpFormatted("~r~Enter a vehicle first!");
            continue;
        }
        const car = playerChar.getCarIsUsing();
        car.fix();
        Text.PrintHelpFormatted("~g~Vehicle repaired");
    }
    //destroy
    if (Pad.IsKeyJustPressed(DESTROYBIND) && !isCarSpawnerMode) {
        if (!playerChar.isInAnyCar()) {
            Text.PrintHelpFormatted("~r~Enter a vehicle first!");
            continue;
        }
        const car = playerChar.getCarIsUsing();
        let playerCoords = playerChar.getCoordinates();
        playerChar.warpFromCarToCoord(playerCoords.x, playerCoords.y, playerCoords.z);
        car.delete();
        Text.PrintHelpFormatted("~g~Vehicle destroyed");
    }
    // flip
    if (Pad.IsKeyJustPressed(FLIPBIND) && !isCarSpawnerMode) {
        if (!playerChar.isInAnyCar()) {
            Text.PrintHelpFormatted("~r~Enter a vehicle first!");
            continue;
        }
        const car = playerChar.getCarIsUsing();
        car.setRoll(0);
        Text.PrintHelpFormatted("~g~Vehicle flipped");
    }
}