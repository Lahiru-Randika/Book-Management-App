import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from './services/book.service';
import { Book } from './models/book';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  books: Book[] = [];

  formData = {
    id: 0,
    title: '',
    author: '',
    isbn: '',
    publicationDate: ''
  };

  isEditMode = false;
  showAddForm = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'confirm' = 'success';

  pendingDeleteId: number | null = null;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
      },
      error: () => {
        this.openModal('Error', 'Failed to load books.', 'error');
      }
    });
  }

  toggleAddForm(): void {
    if (this.showAddForm && !this.isEditMode) {
      this.showAddForm = false;
      this.resetForm();
      return;
    }

    this.resetForm();
    this.isEditMode = false;
    this.showAddForm = true;
  }

  onSubmit(): void {
    if (
      !this.formData.title.trim() ||
      !this.formData.author.trim() ||
      !this.formData.isbn.trim() ||
      !this.formData.publicationDate
    ) {
      this.openModal('Validation Error', 'Please fill all fields.', 'error');
      return;
    }

    if (this.isEditMode) {
      this.bookService.updateBook(this.formData.id, this.formData as Book).subscribe({
        next: () => {
          this.resetForm();
          this.loadBooks();
          this.openModal('Success', 'Book updated successfully.', 'success');
        },
        error: () => {
          this.openModal('Error', 'Failed to update the book.', 'error');
        }
      });
    } else {
      const newBook = {
        title: this.formData.title,
        author: this.formData.author,
        isbn: this.formData.isbn,
        publicationDate: this.formData.publicationDate
      };

      this.bookService.addBook(newBook).subscribe({
        next: () => {
          this.resetForm();
          this.loadBooks();
          this.showAddForm = false;
          this.openModal('Success', 'Book added successfully.', 'success');
        },
        error: () => {
          this.openModal('Error', 'Failed to add the book.', 'error');
        }
      });
    }
  }

  editBook(book: Book): void {
    this.formData = { ...book };
    this.isEditMode = true;
    this.showAddForm = true;
    this.openModal('Edit Book', 'The selected book details have been loaded into the form.', 'success');
  }

  deleteBook(id: number): void {
    this.pendingDeleteId = id;
    this.openModal('Delete Confirmation', 'Are you sure you want to delete this book?', 'confirm');
  }

  confirmDelete(): void {
    if (this.pendingDeleteId === null) {
      return;
    }

    this.bookService.deleteBook(this.pendingDeleteId).subscribe({
      next: () => {
        this.loadBooks();
        this.pendingDeleteId = null;
        this.closeModal();
        this.openModal('Success', 'Book deleted successfully.', 'success');
      },
      error: () => {
        this.pendingDeleteId = null;
        this.closeModal();
        this.openModal('Error', 'Failed to delete the book.', 'error');
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalType = 'success';
  }

  openModal(title: string, message: string, type: 'success' | 'error' | 'confirm'): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.showModal = true;
  }

  resetForm(): void {
    this.formData = {
      id: 0,
      title: '',
      author: '',
      isbn: '',
      publicationDate: ''
    };
    this.isEditMode = false;
  }

  cancelForm(): void {
    this.resetForm();
    this.showAddForm = false;
  }
}