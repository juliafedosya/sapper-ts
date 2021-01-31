'use strict';
class Cell {
    type: string;
    label: string;

    constructor(type: string, label: string = '') {
        this.type = type;
        this.label = label;
    }
}

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

(function () {
    const GAME_GRID_HEIGHT = 14;
    const GAME_GRID_WIDTH = 18;
    const BOMB_AMOUNT = 40;
    const ROOT_ELEMENT = document.getElementById('app');
    const BOMB_TYPE = 'BOMB'
    const NUMBER_TYPE = 'NUMBER'
    const EMPTY_TYPE = 'EMPTY'
    const Y_ATTRIBUTE = 'data-y';
    const X_ATTRIBUTE = 'data-x';
    const bombPositions = generateBombPositions(GAME_GRID_WIDTH, GAME_GRID_HEIGHT, BOMB_AMOUNT);
    const gridData = generateGridData(GAME_GRID_WIDTH, GAME_GRID_HEIGHT, bombPositions);
    const iteratedElements: number[][] = [];
    let bombFound = false;

    function openCells(xCoord: number, yCoord: number): void {
        console.log('yCoord, xCoord', yCoord, xCoord)
        openNeighbourCells(xCoord, yCoord);
    }

    function openNeighbourCells(xCoord: number, yCoord: number): void {
        // console.log('total iterated cells', iteratedElements);
        let currentGridData = gridData[yCoord][xCoord];
        iteratedElements.push([xCoord, yCoord]);
        if (!!currentGridData) {
            let currentElement: HTMLElement | null = document
                .querySelector('div[data-x=' + '"' + xCoord + '"' + '][data-y=' + '"' + yCoord + '"]');
            if (currentGridData.type === NUMBER_TYPE) {
                if(currentElement !== null) {
                displayNumber(currentElement, currentGridData.label);
                }
            } else if (currentGridData.type === EMPTY_TYPE) {
                let currentIteratedCells = createNeighbourElements(xCoord, yCoord, iteratedElements);
                console.log('current iteration cells', currentIteratedCells);
                currentIteratedCells.forEach(tuple => {
                    if (tuple[0] < GAME_GRID_WIDTH && tuple[1] < GAME_GRID_HEIGHT && tuple[0] >= 0 && tuple[1] >= 0) {
                        openNeighbourCells(tuple[0], tuple[1]);
                    }
                });
                if(currentElement !== null) {
                displayEmpty(currentElement);
                }
            } else {
                return;
            }
        }
    }

    function createNeighbourElements(x: number, y: number, iteratedCells: number[][]) {
        let cells = [
            [x - 1, y],
            [x, y - 1],
            [x - 1, y - 1],
            [x + 1, y + 1],
            [x, y + 1],
            [x + 1, y],
            [x - 1, y + 1],
            [x + 1, y - 1]
        ];
        if (iteratedCells.length === 0) {
            return cells;
        }
        console.log('filtered elements', cells.filter(cell => iteratedCells.find(iteratedCell => cell[0] !== iteratedCell[0] && cell[1] !== iteratedCell[1])));

        return cells.filter(cell => !iteratedCells.find(iteratedCell => cell[0] === iteratedCell[0] && cell[1] === iteratedCell[1]));
    }

    function createGameGridElements() {
        const rowGridElements = [];

        for (let i = 0; i < gridData.length; i++) {
            let rowElememnt = document.createElement('div');
            rowElememnt.className = 'grid-row';
            for (let j = 0; j < gridData[i].length; j++) {
                let cell = document.createElement('div');
                cell.className = 'grid-item';
                cell.setAttribute(X_ATTRIBUTE, j.toString())
                cell.setAttribute(Y_ATTRIBUTE, i.toString())
                rowElememnt.appendChild(cell);
            }
            rowGridElements.push(rowElememnt);
        }

        return rowGridElements;
    };

    function generateBombPositions(maxX: number, maxY: number, size: number): Point[] {
        let bombPositions: Point[] = [];
        for (let i = 0; i < size; i++) {
            let x: number;
            let y: number;
            do {
                x = Math.floor(Math.random() * Math.floor(maxX));
                y = Math.floor(Math.random() * Math.floor(maxY));
            }
            while (bombPositions.find(bp => bp.x === x && bp.y === y));
            bombPositions.push({ x, y });
        }
        return bombPositions;
    }

    function countBombsAround(x: number, y: number, bombPositions: Point[]) {
        let xMoreThanZero = (x > 0);
        let yMoreThanZero = (y > 0);
        let xLessThanWidth = (x !== GAME_GRID_WIDTH - 1);
        let yLessThanHeight = (y !== GAME_GRID_HEIGHT - 1);
        let bombAmount = 0;

        if (xMoreThanZero && bombPositions.find(bp => bp.x === x - 1 && bp.y === y)) {
            bombAmount++;
        }

        if (yMoreThanZero && bombPositions.find(bp => bp.x === x && bp.y === y - 1)) {
            bombAmount++;
        }

        if (xLessThanWidth && bombPositions.find(bp => bp.x === x + 1 && bp.y === y)) {
            bombAmount++;
        }

        if (yLessThanHeight && bombPositions.find(bp => bp.x === x && bp.y === y + 1)) {
            bombAmount++;
        }

        if (xMoreThanZero && yMoreThanZero && bombPositions.find(bp => bp.x === x - 1 && bp.y === y - 1)) {
            bombAmount++;
        }

        if (xLessThanWidth && yLessThanHeight && bombPositions.find(bp => bp.x === x + 1 && bp.y === y + 1)) {
            bombAmount++;
        }

        if (xMoreThanZero && yLessThanHeight && bombPositions.find(bp => bp.x === x - 1 && bp.y === y + 1)) {
            bombAmount++;
        }

        if (xLessThanWidth && yMoreThanZero && bombPositions.find(bp => bp.x === x + 1 && bp.y === y - 1)) {
            bombAmount++;
        }

        return bombAmount;
    }

    function generateGridData(maxX: number, maxY: number, bombPositions: Point[]) {
        const gridData: Cell[][] = [];

        for (let i = 0; i < maxY; i++) {
            if (!gridData[i]) {
                gridData.push([]);
            }
            for (let j = 0; j < maxX; j++) {
                const isBomb = bombPositions.find((bp) => bp.x === j && bp.y === i)

                if (isBomb) {
                    gridData[i].push(new Cell(BOMB_TYPE, "*"))
                } else {
                    const bombsAround = countBombsAround(j, i, bombPositions)
                    gridData[i].push(bombsAround > 0 ? new Cell(NUMBER_TYPE, bombsAround.toString()) : new Cell(EMPTY_TYPE))
                }
            }
        }

        return gridData;
    }

    function applyForEachGridElementWithType(cellType: string, processCell: (elem: HTMLElement) => void) {
        let gridItems = Array.from(document.getElementsByClassName('grid-item') as HTMLCollectionOf<HTMLElement>);
        gridItems.forEach(elem => {
            let yAttribute = elem.getAttribute(Y_ATTRIBUTE);
            let xAttribute = elem.getAttribute(X_ATTRIBUTE);
            if (xAttribute !== null && yAttribute !== null) {
                let i: number = Number.parseInt(yAttribute);
                let j: number = Number.parseInt(xAttribute);
                let gridUnit = gridData[i][j];
                if ((!!gridUnit) && gridUnit.type === cellType) {
                    processCell(elem);
                }
            }
        })
    }

    function displayBomb(elem: HTMLElement): void {
        if (!elem.classList.contains('flagged')) {
            elem.innerText = '*';
            elem.classList.add('grid-bomb-item');
        } else {
            console.log('flagged element', elem);
        }
    }

    function displayEmpty(elem: HTMLElement): void {
        removeIfFlagged(elem);
        if (!elem.classList.contains('grid-empty-item')) {
            elem.classList.add('grid-empty-item');
        }
    }

    function displayNumber(elem: HTMLElement, number: string): void {
        removeIfFlagged(elem);
        if (!elem.classList.contains('grid-number-item')) {
            elem.innerText = number;
            elem.classList.add('grid-number-item');
        }
    }

    function removeIfFlagged(elem: HTMLElement): void {
        if (elem.classList.contains('flagged')) {
            elem.classList.remove('flagged');
        }
    }

    function createHandleCellClick(event: any) {
        if (!bombFound) {
            const target = event.target
            if (target.classList.contains('grid-item')) {
                const xCoord = target.getAttribute(X_ATTRIBUTE);
                const yCoord = target.getAttribute(Y_ATTRIBUTE);
                let gridDataUnit = gridData[yCoord][xCoord];
                if (!!gridDataUnit) {
                    let gridDataUnitType = gridDataUnit.type;
                    if (gridDataUnitType === BOMB_TYPE) {
                        bombFound = true;
                        applyForEachGridElementWithType(BOMB_TYPE, displayBomb);
                    } else {
                        openCells(parseInt(xCoord), parseInt(yCoord));
                    }
                }
            }
        }
    }

    function handleRightClick(event: any) {
        const target = event.target
        if (target.classList.contains('grid-item') && !bombFound) {
            event.preventDefault();
            if (target.classList.contains('flagged')) {
                target.classList.remove('flagged');
            } else if (!target.classList.contains('grid-number-item') && !target.classList.contains('grid-empty-item')) {
                target.classList.add('flagged');
            }
        }

    }

    function initializeGameGrid() {
        if (ROOT_ELEMENT !== null) {
            const tempGameGrid = document.createElement('div');
            tempGameGrid.classList.add('game-grid');

            const rowGridElements = createGameGridElements();

            tempGameGrid.addEventListener('click', createHandleCellClick);
            tempGameGrid.addEventListener('contextmenu', handleRightClick);

            rowGridElements.forEach(gridElement => tempGameGrid.appendChild(gridElement));

            ROOT_ELEMENT.appendChild(tempGameGrid);
            console.log('grid data', gridData)
        }

        //console.log(bombPositions);
    }

    console.log('begin initialize');
    initializeGameGrid();

})()