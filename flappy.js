function newElement(tagName, className) {
	const element = document.createElement(tagName);
	element.className = className;
	return element;
}

function Barreira(reversa = false) {
	this.elemento = newElement('div', 'barreira');

	const edge = newElement('div', 'borda');
	const body = newElement('div', 'corpo');
	this.elemento.appendChild(reversa ? body : edge);
	this.elemento.appendChild(reversa ? edge : body);

	this.setAltura = altura => body.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
	this.elemento = newElement('div', 'par-de-barreiras');

	this.superior = new Barreira(true);
	this.inferior = new Barreira(false);

	this.elemento.appendChild(this.superior.elemento);
	this.elemento.appendChild(this.inferior.elemento);

	this.sortearAbertura = () => {
		const alturaSuperior = Math.random() * (altura - abertura);
		const alturaInferior = altura - abertura - alturaSuperior;
		this.superior.setAltura(alturaSuperior);
		this.inferior.setAltura(alturaInferior);
	}

	this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
	this.setX = x => this.elemento.style.left = `${x}px`;
	this.getLargura = () => this.elemento.clientWidth;

	this.sortearAbertura()
	this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
	this.pares = [
		new ParDeBarreiras(altura, abertura, largura),
		new ParDeBarreiras(altura, abertura, largura + espaco),
		new ParDeBarreiras(altura, abertura, largura + espaco * 2),
		new ParDeBarreiras(altura, abertura, largura + espaco * 3),
	];

	const deslocamento = 3;
	this.animar = () => {
		this.pares.forEach(par => {
			par.setX(par.getX() - deslocamento);

			if (par.getX() < -par.getLargura()) {
				par.setX(par.getX() + espaco * this.pares.length);
				par.sortearAbertura();
			};

			const meio = largura / 2;
			const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
			if (cruzouMeio) notificarPonto()
		});
	}
}

function Passaro(alturaJogo) {
	let voando = false;

	this.elemento = newElement('img', 'passaro');
	this.elemento.src = './bird.png';

	this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
	this.setY = y => this.elemento.style.bottom = `${y}px`;

	window.addEventListener('keydown', event => voando = true);
	window.addEventListener('keyup', event => voando = false);

	this.animar = () => {
		const novoY = this.getY() + (voando ? 8 : -5);
		const alturaMaxima = alturaJogo - this.elemento.clientHeight;

		if (novoY <= 0) {
			this.setY(0);
		} else if (novoY >= alturaMaxima) {
			this.setY(alturaMaxima);
		} else {
			this.setY(novoY);
		}
	}
	this.setY(alturaJogo / 2);
}

function Progresso() {
	this.elemento = newElement('span', 'progresso');
	this.atualizarPontos = pontos => {
		this.elemento.innerHTML = pontos;
	}
	this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
	const a = elementoA.getBoundingClientRect();
	const b = elementoB.getBoundingClientRect();

	const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left

	const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

	return horizontal && vertical
}

function colidiu(passaro, barreiras) {
	let colidiu = false

	barreiras.pares.forEach(parDeBarreiras => {
		if (!colidiu) {
			const superior = parDeBarreiras.superior.elemento
			const inferior = parDeBarreiras.inferior.elemento

			colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
		}
	})

	return colidiu;
}

function endGame({ timer, score, gameSpace }) {
	clearInterval(timer)
	const endGameContainer = newElement("div", "endGameContainer")
	gameSpace.appendChild(endGameContainer)
	const endGameInfo = newElement("div", "endGameInfo")
	endGameContainer.appendChild(endGameInfo)

	const text = newElement("h2", "")
	text.innerHTML = `Fim da linha, Campeão<br>Você fez ${score} pontos<br>Aperte qualquer tecla para jogar novamente`
	endGameInfo.appendChild(text);

	window.addEventListener('keydown', event => location.reload());
}

function FlappyBird() {
	let pontos = 0;

	const areaJogo = document.querySelector('[wm-flappy]');
	const altura = areaJogo.clientHeight;
	const largura = areaJogo.clientWidth;

	const progresso = new Progresso();
	const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos));
	const passaro = new Passaro(altura);

	areaJogo.appendChild(progresso.elemento);
	areaJogo.appendChild(passaro.elemento);
	barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento));

	this.start = () => {
		const timer = setInterval(() => {
			barreiras.animar();
			passaro.animar();
			if (colidiu(passaro, barreiras)) {
				endGame({ timer: timer, score: pontos, gameSpace: areaJogo })
			}
		}, 20)
	};
}

new FlappyBird().start();