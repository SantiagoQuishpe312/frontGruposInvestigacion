// import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { timer, Subscription } from 'rxjs';

// export interface TokenExpirationDialogData {
//   minutesLeft: number;
//   forceLogout?: boolean;
//   corsError?: boolean;
//   manualRefreshInstructions?: boolean;
// }

// @Component({
//   selector: 'app-token-expiration-dialog',
//   templateUrl: './token-expiration-dialog.component.html',
//   styleUrls: ['./token-expiration-dialog.component.scss']
// })
// export class TokenExpirationDialogComponent implements OnInit, OnDestroy {
//   totalSecondsLeft: number;
//   initialSecondsLeft: number;
//   private countdownSubscription: Subscription;

//   constructor(
//     public dialogRef: MatDialogRef<TokenExpirationDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: TokenExpirationDialogData
//   ) {
//     const minutes = Math.max(0, Math.floor(data.minutesLeft || 0));
//     this.totalSecondsLeft = minutes * 60;
//     this.initialSecondsLeft = this.totalSecondsLeft;
    
//     console.log('🕐 Temporizador iniciado:', {
//       minutesReceived: data.minutesLeft,
//       minutesUsed: minutes,
//       totalSeconds: this.totalSecondsLeft
//     });
//   }

//   ngOnInit(): void {
//     console.log('🚀 ngOnInit - Estado inicial:', {
//       forceLogout: this.data.forceLogout,
//       manualRefreshInstructions: this.data.manualRefreshInstructions,
//       totalSecondsLeft: this.totalSecondsLeft
//     });

//     if (!this.data.forceLogout && !this.data.manualRefreshInstructions) {
//       if (this.totalSecondsLeft <= 0) {
//         console.log('⚠️ Tiempo inicial es 0 o negativo, cerrando inmediatamente');
//         this.onLogout();
//         return;
//       }

//       console.log('⏰ Iniciando countdown desde:', this.totalSecondsLeft, 'segundos');
      
//       this.countdownSubscription = timer(0, 1000).subscribe((tick) => {
//         console.log(`⏱️ Tick ${tick}: ${this.totalSecondsLeft} segundos restantes`);
        
//         if (tick > 0) {
//           this.totalSecondsLeft--;
//         }
        
//         if (this.totalSecondsLeft <= 0) {
//           console.log('⏰ Tiempo agotado - cerrando sesión automáticamente');
//           this.onLogout();
//           return;
//         }
        
//         if (this.totalSecondsLeft === 30) {
//           console.log('⚠️ Quedan 30 segundos para el cierre automático');
//         } else if (this.totalSecondsLeft === 10) {
//           console.log('⚠️ Quedan 10 segundos para el cierre automático');
//         }
//       });
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.countdownSubscription) {
//       this.countdownSubscription.unsubscribe();
//     }
//   }

//   formatTime(totalSeconds: number): string {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   }

//   getProgressOffset(): number {
//     const circumference = 339.292;
//     const progress = this.totalSecondsLeft / this.initialSecondsLeft;
//     return circumference * (1 - progress);
//   }

//   getProgressColor(): string {
//     const percentageLeft = (this.totalSecondsLeft / this.initialSecondsLeft) * 100;
    
//     if (percentageLeft > 50) {
//       return '#4caf50';
//     } else if (percentageLeft > 25) {
//       return '#ff9800';
//     } else {
//       return '#f44336';
//     }
//   }

//   isUrgent(): boolean {
//     return this.totalSecondsLeft <= 30;
//   }

//   getTitle(): string {
//     if (this.data.forceLogout) return 'Sesión Expirada';
//     if (this.data.corsError) return 'Error de Renovación';
//     if (this.data.manualRefreshInstructions) return 'Renovación Manual';
//     return 'Sesión Próxima a Expirar';
//   }

//   getIcon(): string {
//     if (this.data.forceLogout) return 'error';
//     if (this.data.corsError) return 'sync_problem';
//     if (this.data.manualRefreshInstructions) return 'info';
//     return 'schedule';
//   }

//   getIconColor(): string {
//     if (this.data.forceLogout || this.data.corsError) return 'warn';
//     if (this.data.manualRefreshInstructions) return 'accent';
//     return 'warn';
//   }

//   onRefresh(): void {
//     this.dialogRef.close('refresh');
//   }

//   onRedirectRefresh(): void {
//     this.dialogRef.close('redirect-refresh');
//   }

//   onManualRefresh(): void {
//     this.dialogRef.close('manual-refresh');
//   }

//   onContinue(): void {
//     this.dialogRef.close('continue');
//   }

//   onLogout(): void {
//     this.dialogRef.close('logout');
//   }
// }



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
    
    console.log('🕐 Temporizador iniciado:', {
      minutesReceived: data.minutesLeft,
      minutesUsed: minutes,
      totalSeconds: this.totalSecondsLeft
    });

    // Inicializar audio para alarmas
    this.initializeAlarmAudio();
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit - Estado inicial:', {
      forceLogout: this.data.forceLogout,
      manualRefreshInstructions: this.data.manualRefreshInstructions,
      totalSecondsLeft: this.totalSecondsLeft
    });

    if (!this.data.forceLogout && !this.data.manualRefreshInstructions) {
      if (this.totalSecondsLeft <= 0) {
        console.log('⚠️ Tiempo inicial es 0 o negativo, cerrando inmediatamente');
        this.onLogout();
        return;
      }

      console.log('⏰ Iniciando countdown desde:', this.totalSecondsLeft, 'segundos');
      
      this.countdownSubscription = timer(0, 1000).subscribe((tick) => {
        console.log(`⏱️ Tick ${tick}: ${this.totalSecondsLeft} segundos restantes`);
        
        if (tick > 0) {
          this.totalSecondsLeft--;
        }
        
        // Verificar alarmas sonoras
        this.checkAlarms();
        
        if (this.totalSecondsLeft <= 0) {
          console.log('⏰ Tiempo agotado - cerrando sesión automáticamente');
          this.onLogout();
          return;
        }
        
        if (this.totalSecondsLeft === 30) {
          console.log('⚠️ Quedan 30 segundos para el cierre automático');
        } else if (this.totalSecondsLeft === 10) {
          console.log('⚠️ Quedan 10 segundos para el cierre automático');
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
    if (minutes === 5 && seconds === 0 && !this.alarm5MinPlayed) {
      this.playAlarm();
      this.alarm5MinPlayed = true;
      console.log('🔔 Alarma de 5 minutos reproducida');
    }
    
    // Alarma a los 3 minutos exactos
    if (minutes === 3 && seconds === 0 && !this.alarm3MinPlayed) {
      this.playAlarm();
      this.alarm3MinPlayed = true;
      console.log('🔔 Alarma de 3 minutos reproducida');
    }
    
    // Alarma a 1 minuto exacto
    if (minutes === 1 && seconds === 0 && !this.alarm1MinPlayed) {
      this.playAlarm();
      this.alarm1MinPlayed = true;
      console.log('🔔 Alarma de 1 minuto reproducida');
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
    if (this.data.corsError) return 'Error de Renovación';
    if (this.data.manualRefreshInstructions) return 'Renovación Manual';
    return 'Sesión Próxima a Expirar';
  }

  getIcon(): string {
    if (this.data.forceLogout) return 'error';
    if (this.data.corsError) return 'sync_problem';
    if (this.data.manualRefreshInstructions) return 'info';
    return 'schedule';
  }

  getIconColor(): string {
    if (this.data.forceLogout || this.data.corsError) return 'warn';
    if (this.data.manualRefreshInstructions) return 'accent';
    return 'warn';
  }

  // Método modificado - reemplaza onRefresh()
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



// import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { timer, Subscription } from 'rxjs';

// export interface TokenExpirationDialogData {
//   minutesLeft: number;
//   forceLogout?: boolean;
//   corsError?: boolean;
//   manualRefreshInstructions?: boolean;
// }

// @Component({
//   selector: 'app-token-expiration-dialog',
//   template: `
//     <div class="dialog-container">
//       <mat-dialog-content>
//         <div class="warning-icon">
//           <mat-icon [color]="getIconColor()" style="font-size: 48px; height: 48px; width: 48px;">
//             {{ getIcon() }}
//           </mat-icon>
//         </div>
        
//         <h2 mat-dialog-title class="dialog-title">
//           {{ getTitle() }}
//         </h2>
        
//         <div class="dialog-message">
//           <!-- Mensaje normal de expiración con temporizador -->
//           <div *ngIf="!data.forceLogout && !data.corsError && !data.manualRefreshInstructions">
//             <div class="timer-display">
//               <div class="time-remaining">
//                 <span class="time-number">{{ formatTime(totalSecondsLeft) }}</span>
//                 <div class="time-label">restante</div>
//               </div>
//               <div class="progress-ring">
//                 <svg width="120" height="120">
//                   <circle 
//                     cx="60" 
//                     cy="60" 
//                     r="54" 
//                     stroke="#e0e0e0" 
//                     stroke-width="8" 
//                     fill="none"
//                   />
//                   <circle 
//                     cx="60" 
//                     cy="60" 
//                     r="54" 
//                     stroke="#f44336" 
//                     stroke-width="8" 
//                     fill="none"
//                     [style.stroke-dasharray]="339.292"
//                     [style.stroke-dashoffset]="getProgressOffset()"
//                     [style.stroke]="getProgressColor()"
//                     class="progress-circle"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <p class="session-message">
//               Su sesión expirará automáticamente cuando el temporizador llegue a cero.
//             </p>
//             <p>¿Desea renovar su sesión para continuar trabajando?</p>
//           </div>

//           <!-- Mensaje de error CORS -->
//           <div *ngIf="data.corsError">
//             <div class="timer-display-simple">
//               <span class="time-number-simple">{{ formatTime(totalSecondsLeft) }}</span>
//               <span class="time-label-simple">restante</span>
//             </div>
//             <p>
//               <strong>No se pudo renovar automáticamente su sesión</strong> debido a restricciones de seguridad del navegador.
//             </p>
//             <p>Seleccione una opción para continuar:</p>
//           </div>

//           <!-- Instrucciones de renovación manual -->
//           <div *ngIf="data.manualRefreshInstructions">
//             <p><strong>Se ha abierto una nueva pestaña para renovar su sesión.</strong></p>
//             <p>Por favor:</p>
//             <ol class="instructions-list">
//               <li>Complete el proceso de autenticación en la nueva pestaña</li>
//               <li>Cierre la pestaña de renovación</li>
//               <li>Regrese a esta ventana y haga clic en "Continuar"</li>
//             </ol>
//           </div>

//           <!-- Mensaje de sesión expirada -->
//           <div *ngIf="data.forceLogout">
//             <p>Su sesión ha expirado. Será redirigido a la página de inicio de sesión.</p>
//           </div>
//         </div>
//       </mat-dialog-content>
      
//       <!-- Botones para renovación normal -->
//       <mat-dialog-actions align="center" *ngIf="!data.forceLogout && !data.corsError && !data.manualRefreshInstructions">
//         <button mat-raised-button color="primary" (click)="onRefresh()" class="action-button">
//           <mat-icon>refresh</mat-icon>
//           Renovar Sesión
//         </button>
//         <button mat-button color="warn" (click)="onLogout()" class="action-button">
//           <mat-icon>logout</mat-icon>
//           Cerrar Sesión
//         </button>
//       </mat-dialog-actions>

//       <!-- Botones para error CORS -->
//       <mat-dialog-actions align="center" *ngIf="data.corsError">
//         <button mat-raised-button color="primary" (click)="onRedirectRefresh()">
//           <mat-icon>open_in_new</mat-icon>
//           Renovar (Redirect)
//         </button>
//         <button mat-button color="accent" (click)="onManualRefresh()">
//           <mat-icon>tab</mat-icon>
//           Renovar (Nueva Pestaña)
//         </button>
//         <button mat-button color="warn" (click)="onLogout()">
//           <mat-icon>logout</mat-icon>
//           Cerrar Sesión
//         </button>
//       </mat-dialog-actions>

//       <!-- Botones para instrucciones manuales -->
//       <mat-dialog-actions align="center" *ngIf="data.manualRefreshInstructions">
//         <button mat-raised-button color="primary" (click)="onContinue()">
//           <mat-icon>check</mat-icon>
//           Continuar
//         </button>
//         <button mat-button color="warn" (click)="onLogout()">
//           <mat-icon>logout</mat-icon>
//           Cerrar Sesión
//         </button>
//       </mat-dialog-actions>
      
//       <!-- Botones para logout forzado -->
//       <mat-dialog-actions align="center" *ngIf="data.forceLogout">
//         <button mat-raised-button color="primary" (click)="onLogout()">
//           <mat-icon>login</mat-icon>
//           Ir a Inicio de Sesión
//         </button>
//       </mat-dialog-actions>
//     </div>
//   `,
//   styles: [`
//     .dialog-container {
//       text-align: center;
//       padding: 20px;
//       min-width: 320px;
//     }
    
//     .warning-icon {
//       margin-bottom: 16px;
//     }
    
//     .dialog-title {
//       margin-bottom: 16px;
//       font-weight: 500;
//     }
    
//     .dialog-message {
//       margin-bottom: 24px;
//       line-height: 1.5;
//       text-align: left;
//     }
    
//     .dialog-message p {
//       margin: 8px 0;
//     }

//     /* Estilos del temporizador principal */
//     .timer-display {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       margin: 20px 0;
//       position: relative;
//     }

//     .time-remaining {
//       position: absolute;
//       top: 50%;
//       left: 50%;
//       transform: translate(-50%, -50%);
//       text-align: center;
//       z-index: 10;
//     }

//     .time-number {
//       font-size: 18px;
//       font-weight: bold;
//       color: #f44336;
//       display: block;
//       font-family: 'Courier New', monospace;
//     }

//     .time-label {
//       font-size: 12px;
//       color: #666;
//       margin-top: 4px;
//     }

//     .progress-ring {
//       position: relative;
//     }

//     .progress-circle {
//       transform: rotate(-90deg);
//       transform-origin: 50% 50%;
//       transition: stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out;
//     }

//     /* Temporizador simple para casos especiales */
//     .timer-display-simple {
//       text-align: center;
//       margin: 16px 0;
//       padding: 12px;
//       background: #ffebee;
//       border-radius: 8px;
//       border: 2px solid #ffcdd2;
//     }

//     .time-number-simple {
//       font-size: 24px;
//       font-weight: bold;
//       color: #f44336;
//       font-family: 'Courier New', monospace;
//     }

//     .time-label-simple {
//       font-size: 14px;
//       color: #666;
//       margin-left: 8px;
//     }

//     .session-message {
//       text-align: center;
//       font-style: italic;
//       color: #666;
//       margin: 16px 0 8px 0;
//     }

//     .instructions-list {
//       margin: 12px 0;
//       padding-left: 20px;
//     }

//     .instructions-list li {
//       margin: 8px 0;
//     }
    
//     mat-dialog-actions {
//       gap: 12px;
//       flex-wrap: wrap;
//     }
    
//     mat-dialog-actions button {
//       min-width: 140px;
//       margin: 4px;
//     }

//     .action-button {
//       font-weight: 500;
//     }

//     .dialog-message strong {
//       color: #f44336;
//     }

//     /* Animación de pulso cuando quedan pocos segundos */
//     .time-number.urgent {
//       animation: pulse 1s infinite;
//     }

//     @keyframes pulse {
//       0% {
//         transform: scale(1);
//         color: #f44336;
//       }
//       50% {
//         transform: scale(1.1);
//         color: #d32f2f;
//       }
//       100% {
//         transform: scale(1);
//         color: #f44336;
//       }
//     }
//   `]
// })
// export class TokenExpirationDialogComponent implements OnInit, OnDestroy {
//   totalSecondsLeft: number;
//   initialSecondsLeft: number;
//   private countdownSubscription: Subscription;

//   constructor(
//     public dialogRef: MatDialogRef<TokenExpirationDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: TokenExpirationDialogData
//   ) {
//     // Convertir minutos a segundos con validación
//     const minutes = Math.max(0, Math.floor(data.minutesLeft || 0));
//     this.totalSecondsLeft = minutes * 60;
//     this.initialSecondsLeft = this.totalSecondsLeft;
    
//     console.log('🕐 Temporizador iniciado:', {
//       minutesReceived: data.minutesLeft,
//       minutesUsed: minutes,
//       totalSeconds: this.totalSecondsLeft
//     });
//   }

//   ngOnInit(): void {
//     console.log('🚀 ngOnInit - Estado inicial:', {
//       forceLogout: this.data.forceLogout,
//       manualRefreshInstructions: this.data.manualRefreshInstructions,
//       totalSecondsLeft: this.totalSecondsLeft
//     });

//     if (!this.data.forceLogout && !this.data.manualRefreshInstructions) {
//       if (this.totalSecondsLeft <= 0) {
//         console.log('⚠️ Tiempo inicial es 0 o negativo, cerrando inmediatamente');
//         this.onLogout();
//         return;
//       }

//       console.log('⏰ Iniciando countdown desde:', this.totalSecondsLeft, 'segundos');
      
//       // Actualizar el contador cada segundo
//       this.countdownSubscription = timer(0, 1000).subscribe((tick) => {
//         console.log(`⏱️ Tick ${tick}: ${this.totalSecondsLeft} segundos restantes`);
        
//         if (tick > 0) { // No decrementar en el primer tick (tick 0)
//           this.totalSecondsLeft--;
//         }
        
//         // Cerrar automáticamente cuando llegue a 0
//         if (this.totalSecondsLeft <= 0) {
//           console.log('⏰ Tiempo agotado - cerrando sesión automáticamente');
//           this.onLogout();
//           return;
//         }
        
//         // Mostrar advertencia en consola cuando quedan pocos segundos
//         if (this.totalSecondsLeft === 30) {
//           console.log('⚠️ Quedan 30 segundos para el cierre automático');
//         } else if (this.totalSecondsLeft === 10) {
//           console.log('⚠️ Quedan 10 segundos para el cierre automático');
//         }
//       });
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.countdownSubscription) {
//       this.countdownSubscription.unsubscribe();
//     }
//   }

//   /**
//    * Formatea el tiempo en formato MM:SS
//    */
//   formatTime(totalSeconds: number): string {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   }

//   /**
//    * Calcula el offset para el círculo de progreso
//    */
//   getProgressOffset(): number {
//     const circumference = 339.292; // 2 * PI * 54
//     const progress = this.totalSecondsLeft / this.initialSecondsLeft;
//     return circumference * (1 - progress);
//   }

//   /**
//    * Obtiene el color del círculo de progreso basado en el tiempo restante
//    */
//   getProgressColor(): string {
//     const percentageLeft = (this.totalSecondsLeft / this.initialSecondsLeft) * 100;
    
//     if (percentageLeft > 50) {
//       return '#4caf50'; // Verde
//     } else if (percentageLeft > 25) {
//       return '#ff9800'; // Naranja
//     } else {
//       return '#f44336'; // Rojo
//     }
//   }

//   /**
//    * Determina si el temporizador debe mostrar animación urgente
//    */
//   isUrgent(): boolean {
//     return this.totalSecondsLeft <= 30;
//   }

//   getTitle(): string {
//     if (this.data.forceLogout) return 'Sesión Expirada';
//     if (this.data.corsError) return 'Error de Renovación';
//     if (this.data.manualRefreshInstructions) return 'Renovación Manual';
//     return 'Sesión Próxima a Expirar';
//   }

//   getIcon(): string {
//     if (this.data.forceLogout) return 'error';
//     if (this.data.corsError) return 'sync_problem';
//     if (this.data.manualRefreshInstructions) return 'info';
//     return 'schedule';
//   }

//   getIconColor(): string {
//     if (this.data.forceLogout || this.data.corsError) return 'warn';
//     if (this.data.manualRefreshInstructions) return 'accent';
//     return 'warn';
//   }

//   onRefresh(): void {
//     this.dialogRef.close('refresh');
//   }

//   onRedirectRefresh(): void {
//     this.dialogRef.close('redirect-refresh');
//   }

//   onManualRefresh(): void {
//     this.dialogRef.close('manual-refresh');
//   }

//   onContinue(): void {
//     this.dialogRef.close('continue');
//   }

//   onLogout(): void {
//     this.dialogRef.close('logout');
//   }
// }