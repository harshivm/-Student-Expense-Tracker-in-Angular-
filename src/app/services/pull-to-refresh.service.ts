import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PullToRefreshService {
  private pullStartY = 0;
  private isDragging = false;
  private pullDistance = 0;
  
  public onRefresh = new EventEmitter<void>();
  public pullProgress = new EventEmitter<number>();

  init(element: HTMLElement): void {
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Also handle mouse events for desktop testing
    element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    element.addEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.target instanceof HTMLElement) {
      const target = event.target as HTMLElement;
      const isAtTop = target.scrollTop === 0;
      
      if (isAtTop) {
        this.pullStartY = event.touches[0].clientY;
        this.isDragging = true;
      }
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    const currentY = event.touches[0].clientY;
    this.pullDistance = currentY - this.pullStartY;
    
    if (this.pullDistance > 0) {
      event.preventDefault();
      const progress = Math.min(this.pullDistance / 150, 1); // Max pull distance 150px
      this.pullProgress.emit(progress);
    }
  }

  private handleTouchEnd(): void {
    if (this.isDragging && this.pullDistance > 100) {
      this.onRefresh.emit();
    }
    
    this.reset();
    this.pullProgress.emit(0);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      const target = event.target as HTMLElement;
      const isAtTop = target.scrollTop === 0;
      
      if (isAtTop) {
        this.pullStartY = event.clientY;
        this.isDragging = true;
      }
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    const currentY = event.clientY;
    this.pullDistance = currentY - this.pullStartY;
    
    if (this.pullDistance > 0) {
      const progress = Math.min(this.pullDistance / 150, 1);
      this.pullProgress.emit(progress);
    }
  }

  private handleMouseUp(): void {
    if (this.isDragging && this.pullDistance > 100) {
      this.onRefresh.emit();
    }
    
    this.reset();
    this.pullProgress.emit(0);
  }

  private reset(): void {
    this.pullStartY = 0;
    this.pullDistance = 0;
    this.isDragging = false;
  }
}