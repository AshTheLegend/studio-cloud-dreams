import { Html, useProgress } from '@react-three/drei';

export const LoadingScene = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="glass-panel px-6 py-4 text-center">
        <div className="text-foreground font-medium mb-2">
          Loading Studio...
        </div>
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
};