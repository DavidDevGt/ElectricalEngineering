# Cómo correr el simulador localmente

Requiere Node.js 20+ (verificado con Node 22) y npm.

1. Instala las dependencias desde la raíz del repositorio:

   ```bash
   npm install
   ```

2. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Vite sirve el proyecto en `http://localhost:8005` y abre el navegador automáticamente. Los
    cambios en `src/` se reflejan en vivo (hot module replacement) sin recargar la página.

    Para acceder desde otro dispositivo en la misma red (VPN), usa la IP de tu máquina:
    `http://192.168.196.42:8005` (reemplaza con la IP de tu interfaz de red).

3. Mueve el slider **Factor de carga** del panel superior izquierdo. El transformador recalcula
   pérdidas y eficiencia en tiempo real, y la esfera de estado sobre el tanque cambia de ámbar a
   verde cuando la carga se acerca al punto de eficiencia óptima.

## Otros comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run build` | Compila TypeScript y genera el bundle de producción en `dist/` |
| `npm run preview` | Sirve el resultado de `npm run build` localmente, para verificar el bundle final |
| `npm run typecheck` | Corre `tsc` sin emitir archivos — verificación de tipos únicamente |

## Precaución

Si el puerto 8005 ya está en uso por una instancia anterior del servidor, Vite tomará el
siguiente puerto libre automáticamente y lo mostrará en la terminal — no asumas que siempre es
8005 si tenías otra instancia corriendo.

## Ver también

- [`../adr/0002-separacion-modelo-dominio-render.md`](../adr/0002-separacion-modelo-dominio-render.md) — por qué la lógica del transformador vive fuera de la escena 3D.
- [`agregar-un-componente-3d.md`](agregar-un-componente-3d.md) — el siguiente paso natural una vez el simulador corre localmente.
