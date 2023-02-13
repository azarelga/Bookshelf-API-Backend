const { nanoid } = require('nanoid');
const {books} = require('./books');

const addBookHandler = (request, h) => {
	const {
		name, 
		year, 
		author, 
		summary,
		publisher, 
		pageCount, 
		readPage, 
		reading
	} = request.payload;

	const id = nanoid(16);
	const finished = pageCount === readPage;
	const insertedAt = new Date().toISOString();
	const updatedAt = insertedAt;
	
	const newBook = {
		id,
		name, 
		year, 
		author, 
		summary,
		publisher, 
		pageCount, 
		readPage, 
		finished,
		reading,
		insertedAt,
		updatedAt
	}


	if (name === undefined) {
		const response = h.response({
			status: 'fail',
			message: 'Gagal menambahkan buku. Mohon isi nama buku',
		});
		response.code(400);
		return response;
	} else if (readPage > pageCount) {
		const response = h.response({
			status: 'fail',
			message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);
		return response;
	}

	books.push(newBook);

	if (books.filter((book) => book.id === id).length > 0) {
		const response = h.response({
			status: 'success',
			message: 'Buku berhasil ditambahkan',
			data: {
				bookId: id,
			},
		});
		response.code(201);
		return response;
	} 
	const response = h.response({
		status: 'fail',
		message: 'Buku gagal ditambahkan',
	});
	response.code(500);
	return response;
}


const getAllBooksHandler = (request,h) => {
	const condition = request.query;
	const conditionKey = Object.keys(condition);
	var selectedBooks = books;
	if (conditionKey.includes('reading')) {
		const truth = (condition['reading'] === '1') ? true : false;
		selectedBooks = selectedBooks.filter((n) => n.reading == truth);
	};
	if (conditionKey.includes('finished')) {
		const truth = (condition['finished'] === '1') ? true : false;
		selectedBooks = selectedBooks.filter((n) => n.finished == truth);
	};  
	if (conditionKey.includes('name')) {
		selectedBooks = selectedBooks.filter((n) => (n.name.toLowerCase()).includes(condition['name'].toLowerCase()));
	};

	const shortBooks = [];
	for (let i = 0; i < selectedBooks.length; i++) {
		const bookIter = {};
		bookIter.id = selectedBooks[i].id;
		bookIter.name = selectedBooks[i].name;
		bookIter.publisher = selectedBooks[i].publisher;
		shortBooks.push(bookIter);
	}

	const response = h.response({
		status: 'success',
		data: {
			books : shortBooks,
		}
	})
	response.code(200)
	return response
};

const getBookByIdHandler = (request, h) => {
	const {id} = request.params;
	const book = books.filter((n) => n.id == id)[0];


	if (book === undefined) {	
		const response = h.response({
			status: 'fail',
			message: 'Buku tidak ditemukan',
		});
		response.code(404);
		return response;
	}

	return {
		status: 'success',
		data: {
			book,
		},
	};
};


const editBookByIdHandler = (request, h) => {
	const {id} = request.params;
	const {
		name, year, author, summary, publisher, pageCount, readPage, reading
	} = request.payload;
	const updatedAt = new Date().toISOString();
	const bookIdx = books.findIndex((b) => b.id == id);

	if (name === undefined) {
		const response = h.response({
			status : "fail",
			message : "Gagal memperbarui buku. Mohon isi nama buku",
		});
		response.code(400);
		return response
	} else if (readPage > pageCount) {
		const response = h.response({
			status : "fail",
			message : "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
		});
		response.code(400);
		return response
	} else if (bookIdx === -1) {
		const response = h.response({
			status : "fail",
			message : "Gagal memperbarui buku. Id tidak ditemukan",
		});
		response.code(404);
		return response
	}
	
	books[bookIdx] = {
		...books[bookIdx],
		name, year, author, summary, publisher, pageCount, readPage, reading,
		updatedAt,
	}

	const response = h.response({
		status : "success",
		message : "Buku berhasil diperbarui",
	});
	response.code(200);
	return response
}


const deleteBookByIdHandler = (request, h) => {
	const { id } = request.params;
	const idx = books.findIndex((book) => book.id === id);
	if (idx !== -1) {
		books.splice(idx, 1);
		const response = h.response({
			status: 'success',
			message: 'Buku berhasil dihapus',
		});
		response.code(200);
		return response;
	};

	const response = h.response({
		status: 'fail',
		message: 'Buku gagal dihapus. Id tidak ditemukan',
	});
	response.code(404);
	return response;
}


module.exports = {
	addBookHandler,
	getAllBooksHandler,
	getBookByIdHandler,
	editBookByIdHandler,
	deleteBookByIdHandler,
}
