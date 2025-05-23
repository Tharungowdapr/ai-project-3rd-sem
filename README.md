# Real-Time Traffic Monitoring Dashboard

A real-time traffic monitoring system that uses computer vision to detect and track vehicles, pedestrians, and animals in video streams.

## Features

- Real-time object detection using YOLOv8
- Object tracking and trajectory analysis
- Traffic density monitoring
- Incident detection
- Interactive dashboard with charts and statistics
- Video playback controls
- Data export capabilities

## Deployment Status

The application is deployed and accessible at:
- Frontend: https://tharungowdapr.github.io/ai-project-3rd-sem/
- Backend: https://traffic-monitoring-backend.onrender.com

## Deployment

### GitHub Pages Deployment

1. Fork this repository
2. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select the `gh-pages` branch as the source
   - Save the settings

3. Set up GitHub Secrets:
   - Go to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `VITE_API_URL`: Your backend API URL

4. Push to main branch to trigger deployment:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

The application will be available at: `https://<your-username>.github.io/real-time-traffic-monitoring-dashboard/`

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/<your-username>/real-time-traffic-monitoring-dashboard.git
cd real-time-traffic-monitoring-dashboard
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
python server.py
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
