import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timer, Subscription } from 'rxjs';

export interface TokenExpirationDialogData {
  minutesLeft: number;
  forceLogout?: boolean;
  corsError?: boolean;
  manualRefreshInstructions?: boolean;
}

@Component({
  selector: 'app-token-expiration-dialog',
  templateUrl: './token-expiration-dialog.component.html',
  styleUrls: ['./token-expiration-dialog.component.scss']
})
export class TokenExpirationDialogComponent implements OnInit, OnDestroy {
  totalSecondsLeft: number;
  initialSecondsLeft: number;
  private countdownSubscription: Subscription;
  
  // Variables para las alarmas sonoras
  private alarmAudio: HTMLAudioElement;
  private alarm5MinPlayed = false;
  private alarm3MinPlayed = false;
  private alarm1MinPlayed = false;

  constructor(
    public dialogRef: MatDialogRef<TokenExpirationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TokenExpirationDialogData
  ) {
    const minutes = Math.max(0, Math.floor(data.minutesLeft || 0));
    this.totalSecondsLeft = minutes * 60;
    this.initialSecondsLeft = this.totalSecondsLeft;

    // Inicializar audio para alarmas
    this.initializeAlarmAudio();
  }

  ngOnInit(): void {


    if (!this.data.forceLogout && !this.data.manualRefreshInstructions) {
      if (this.totalSecondsLeft <= 0) {
        this.onLogout();
        return;
      }

      
      this.countdownSubscription = timer(0, 1000).subscribe((tick) => {
        
        if (tick > 0) {
          this.totalSecondsLeft--;
        }
        
        // Verificar alarmas sonoras
        this.checkAlarms();
        
        if (this.totalSecondsLeft <= 0) {
          this.onLogout();
          return;
        }
        
        if (this.totalSecondsLeft === 30) {
        } else if (this.totalSecondsLeft === 10) {
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    // Detener cualquier sonido que esté reproduciéndose
    if (this.alarmAudio) {
      this.alarmAudio.pause();
      this.alarmAudio.currentTime = 0;
    }
  }

  private initializeAlarmAudio(): void {
    // Crear audio context para la alarma
    // Usando un tono básico generado por código ya que no podemos cargar archivos externos
    this.alarmAudio = new Audio();
    
    // Generar un tono de alarma simple usando data URL
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configurar el tono de la alarma
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volumen al 30%
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  }

  private checkAlarms(): void {
    const minutes = Math.floor(this.totalSecondsLeft / 60);
    const seconds = this.totalSecondsLeft % 60;

    // Alarma a los 5 minutos exactos
    if (minutes === 10 && seconds === 0 && !this.alarm5MinPlayed) {
      this.playAlarm();
      this.alarm5MinPlayed = true;
    }
    
    // Alarma a los 3 minutos exactos
    if (minutes === 5 && seconds === 0 && !this.alarm3MinPlayed) {
      this.playAlarm();
      this.alarm3MinPlayed = true;
    }
    
    // Alarma a 1 minuto exacto
    if (minutes === 1 && seconds === 0 && !this.alarm1MinPlayed) {
      this.playAlarm();
      this.alarm1MinPlayed = true;
    }
  }

  private playAlarm(): void {
    try {
      // Crear una secuencia de beeps para la alarma
      this.createAlarmBeeps();
    } catch (error) {
      console.warn('No se pudo reproducir la alarma sonora:', error);
      // Fallback: vibración si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  }

  private createAlarmBeeps(): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Crear 3 beeps cortos
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, i * 400); // 400ms entre cada beep
    }
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getProgressOffset(): number {
    const circumference = 339.292;
    const progress = this.totalSecondsLeft / this.initialSecondsLeft;
    return circumference * (1 - progress);
  }

  getProgressColor(): string {
    const percentageLeft = (this.totalSecondsLeft / this.initialSecondsLeft) * 100;
    
    if (percentageLeft > 50) {
      return '#4caf50';
    } else if (percentageLeft > 25) {
      return '#ff9800';
    } else {
      return '#f44336';
    }
  }

  isUrgent(): boolean {
    return this.totalSecondsLeft <= 30;
  }

  getTitle(): string {
    if (this.data.forceLogout) return 'Sesión Expirada';
    return 'Sesión Próxima a Expirar';
  }

  getIcon(): string {
    if (this.data.forceLogout) return 'error';
    return 'schedule';
  }

  getIconColor(): string {
    if (this.data.forceLogout || this.data.corsError) return 'warn';
    if (this.data.manualRefreshInstructions) return 'accent';
    return 'warn';
  }

  onAccept(): void {
    this.dialogRef.close('accept');
  }

  onRedirectRefresh(): void {
    this.dialogRef.close('redirect-refresh');
  }

  onManualRefresh(): void {
    this.dialogRef.close('manual-refresh');
  }

  onContinue(): void {
    this.dialogRef.close('continue');
  }

  onLogout(): void {
    this.dialogRef.close('logout');
  }
}
