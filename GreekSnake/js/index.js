const sw = 20,
    sh = 20,
    td = 30,
    tr = 30
const snakeWrap = document.getElementById('snakeWrap')
const startBtn = document.querySelector('.startBtn button')
const pauseBtn = document.querySelector('.pauseBtn button')
let snake = null
let game = null
let food = null
let score = 0

class Square {
    constructor(x, y, className) {
        this.x = x * sw
        this.y = y * sh
        this.class = className

        this.viewContent = document.createElement('div')
        this.viewContent.className = this.class
        this.parent = snakeWrap
    }

    create() {
        this.viewContent.style.position = 'absolute'
        this.viewContent.style.width = sw + 'px'
        this.viewContent.style.height = sh + 'px'
        this.viewContent.style.left = this.x + 'px'
        this.viewContent.style.top = this.y + 'px'
        this.parent.appendChild(this.viewContent)
    }

    remove() {
        this.parent.removeChild(this.viewContent)
    }
}

class Snake {
    constructor() {
        // 存储蛇点坐标
        this.pos = []
        this.head = null
        this.tail = null
        // 方向对象
        this.directionNum = {
            up: {
                x: 0,
                y: -1,
                rotate: -90
            },
            down: {
                x: 0,
                y: 1,
                rotate: 90
            },
            right: {
                x: 1,
                y: 0,
                rotate: 0
            },
            left: {
                x: -1,
                y: 0,
                rotate: 180
            }
        }
        // 默认方向
        this.direction = this.directionNum.right
    }

    init() {
        // 蛇头
        let snakeHead = new Square(2, 0, 'snakeHeader')
        snakeHead.create()
        this.head = snakeHead
        this.pos.push([2, 0])
        // 蛇身1
        let snakeBody1 = new Square(1, 0, 'snakeBody')
        snakeBody1.create()
        this.pos.push([1, 0])
        // 蛇身2
        let snakeBody2 = new Square(0, 0, 'snakeBody')
        snakeBody2.create()
        this.tail = snakeBody2
        this.pos.push([0, 0])

        // 建立联系 ------ 链表关系
        snakeHead.last = null
        snakeHead.next = snakeBody1

        snakeBody1.last = snakeHead
        snakeBody1.next = snakeBody2

        snakeBody2.last = snakeBody1
        snakeBody2.next = null
    }

    getNextPos() {
        // 下一个位置的坐标
        let nextPos = [
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]

        // 如果碰到自己，over
        let isSelf = false
        this.pos.forEach(item => {
            if (item[0] == nextPos[0] && item[1] == nextPos[1]) {
                isSelf = true
            }
        })
        if (isSelf) {
            console.log('碰到自己啦')
            this.strategies.over.call(this)
            game.over()
            return
        }

        // 如果碰到墙，over
        if (nextPos[0] < 0 || nextPos[0] > td - 1 || nextPos[1] < 0 || nextPos[1] > tr - 1) {
            console.log('碰到墙啦')
            this.strategies.over.call(this)
            game.over()
            return
        }

        // 如果碰到苹果，吃 +1
        if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
            this.strategies.eat.call(this)
            score++
            return
        }
        // 如果啥都没有，继续走
        this.strategies.move.call(this)
    }

    // 接下去要做的事
    strategies = {
        // 移动
        move(isMOve) {
            let newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody')
            newBody.last = null
            newBody.next = this.head.next
            newBody.next.last = newBody
            newBody.create()
            this.head.remove()

            let newHead = new Square(this.head.x / sw + this.direction.x,
                this.head.y / sh + this.direction.y, 'snakeHeader')
            newHead.next = newBody
            newHead.next.last = newHead
            newHead.last = null
            newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
            newHead.create()

            // 更换坐标
            this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
            this.head = newHead

            if (!isMOve) {
                // 移出蛇尾
                this.tail.remove()
                // 重新定义蛇尾
                this.tail = this.tail.last
                // 移出蛇尾坐标
                this.pos.pop()
            }
        },

        // 吃苹果
        eat() {
            this.strategies.move.call(this, true)
            createFood()
        },

        // 游戏结束
        over() {
            console.log('游戏结束')
        }

    }
}
snake = new Snake()

// 生成一个食物
function createFood() {
    let x = null,
        y = null

    let include = true

    while (include) {
        x = Math.round(Math.random() * (td - 1))
        y = Math.round(Math.random() * (tr - 1))

        snake.pos.forEach(item => {
            if (item[0] != x && item[1] != y) {
                include = false
            }
        })

    }

    food = new Square(x, y, 'food')
    food.pos = [x, y]
    let foodDom = document.querySelector('.food')
    if (foodDom) {
        foodDom.style.left = x * sw + 'px'
        foodDom.style.top = y * sh + 'px'
    } else {
        food.create()
    }
}

class Game {
    constructor() {
        this.timer = null
    }

    init() {
        snake.init()
        // snake.getNextPos()
        createFood()
        this.start()

        document.onkeydown = function (e) {
            if (e.which == 37 && snake.direction != snake.directionNum.right) {
                snake.direction = snake.directionNum.left
            } else if (e.which == 38 && snake.direction != snake.directionNum.down) {
                snake.direction = snake.directionNum.up
            } else if (e.which == 39 && snake.direction != snake.directionNum.left) {
                snake.direction = snake.directionNum.right
            } else if (e.which == 40 && snake.direction != snake.directionNum.up) {
                snake.direction = snake.directionNum.down
            }
        }
    }

    start() {
        this.timer = setInterval(() => {
            snake.getNextPos()
        }, 200);

    }
    pause() {
        clearInterval(this.timer)
    }
    over() {
        clearInterval(this.timer)
        alert('游戏结束！您的得分是：' + score)
        snakeWrap.innerHTML = ''
        startBtn.parentNode.style.display = 'block'
        snake = new Snake()
        game = new Game()
    }
}
game = new Game()
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none'
    game.init()
}
snakeWrap.onclick = function () {
    pauseBtn.parentNode.style.display = 'block'
    game.pause()
}
pauseBtn.onclick = function () {
    pauseBtn.parentNode.style.display = 'none'
    game.start()
}