let imageArray = []

for(let i=0; i<15; i++){
    let section = document.createElement('section')
    let div = document.createElement('div')
    div.classList.add('image__container')
    let image = document.createElement('img')
    image.src = `./assets/${i+1}.avif`

    div.appendChild(image)
    section.appendChild(div)
    document.body.appendChild(section)
}

let options = {
    rootMargin: '0px',
    threshold: 1.0
}

let callback = (entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            // console.log(entry.target.classList[0]) // 이미지 id 값 
            imageArray[+entry.target.classList[0]].reveal()
        }
    })
})

let observer = new IntersectionObserver(callback, options)

class PixelImage{
    constructor(id, image, width, height){
        this.id = id
        this.image = image 
        this.styleWidth = width // 이미지 실제크기
        this.styleHeight = height
        this.width = width * window.devicePixelRatio // 이미지 실제크기에 DPR을 곱해줘서 캔버스 픽셀이 물리적 픽셀과 동일하게 동작하도록 하여 이미지를 선명하게 보여주도록 함
        this.height = height * window.devicePixelRatio
        this.percentage = 0.01 // 크기가 1에 가까울수록 이미지 픽셀이 점점더 작아지고 선명해짐
        this.applyCanvas()
        this.draw()
        // console.log("해상도 높이: ", id, window.devicePixelRatio, height, this.height)
    }
    applyCanvas(){
        this.canvas = document.createElement('canvas')
        this.canvas.classList.add(this.id)
        this.ctx = this.canvas.getContext('2d')
        this.image.parentElement.appendChild(this.canvas)
        this.canvas.width = this.width  // 해상도 결정
        this.canvas.height = this.height
        this.canvas.style.width = `${this.styleWidth}px` // 실제크기 결정
        this.canvas.style.height = `${this.styleHeight}px`
        this.scaledWidth = this.width * this.percentage // 단위픽셀
        this.scaledHeight = this.height * this.percentage

        // turn off image aliasing 
        this.ctx.msImageSmoothingEnabled = false 
        this.ctx.mozImageSmoothingEnabled = false 
        this.ctx.webkitImageSmoothingEnabled = false 
        this.ctx.imageSmoothingEnabled = false 

        observer.observe(this.canvas)

    }
    // 축소된 이미지를 다시 확대하면 이미지가 흐리게 보이고, 픽셀도 다 드러나보임
    // 일반적으로 작은 이미지를 확대하면 해상도가 깨지는 원리 
    draw(){
        this.ctx.drawImage(this.image, 0, 0, this.scaledWidth, this.scaledHeight) // 이미지 축소
        this.ctx.drawImage(this.canvas, 0, 0, this.scaledWidth, this.scaledHeight, 0, 0, this.width, this.height) // 축소된 이미지 다시 확대
    }
    reveal(){
        // console.log('이미지 보이기', this.id)
        this.canvas.classList.add('active')
        this.percentage = this.percentage < .1 ? this.percentage += .003 : this.percentage += .2 // this.percentage 가 0.1 보다 작을때는 이미지가 서서히 드러나다가, 0.1보다 커지면 빠르게 선명해짐
        if(this.percentage > 1) this.percentage = 1
        this.scaledWidth = this.width * this.percentage // 단위픽셀
        this.scaledHeight = this.height * this.percentage
        this.ctx.drawImage(this.image, 0, 0, this.scaledWidth, this.scaledHeight) // 이미지 축소
        this.ctx.drawImage(this.canvas, 0, 0, this.scaledWidth, this.scaledHeight, 0, 0, this.width, this.height) // 축소된 이미지 다시 확대
        if(this.percentage < 1) requestAnimationFrame(this.reveal.bind(this)) // this.percentage 가 1이 될때까지 이미지를 서서히 선명하게 그림

    }
}

function generatePixelImages(){
    let iamges = [...document.querySelectorAll('img')]
    iamges.forEach((image, idx) => {
        let {width, height} = image.getBoundingClientRect()
        let pixelImage = new PixelImage(idx, image, width, height)
        imageArray.push(pixelImage)
    })
}

setTimeout(() => {
    generatePixelImages()
}, 100);