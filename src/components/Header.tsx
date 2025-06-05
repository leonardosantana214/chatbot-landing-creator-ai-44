
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  onCTAClick: () => void;
  onDemoClick?: () => void;
}

const Header = ({ onNavigate, onCTAClick, onDemoClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Como Funciona', id: 'how-it-works' },
    { label: 'Planos', id: 'pricing' },
    { label: 'Conectar', id: 'connection' },
    { label: 'Contato', id: 'contact' }
  ];

  return (
    <header className="bg-white shadow-lg fixed w-full top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
              alt="Techcorps Logo" 
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-black">Techcorps</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="text-gray-700 hover:text-black transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex space-x-3">
            {onDemoClick && (
              <Button 
                onClick={onDemoClick} 
                variant="outline"
                className="border-[#FF914C] text-[#FF914C] hover:bg-[#FF914C] hover:text-white px-6 py-2"
              >
                Experimentar demonstração
              </Button>
            )}
            <Button onClick={onCTAClick} className="bg-black text-white hover:bg-gray-800 px-6 py-2">
              Comece Agora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-black transition-colors font-medium text-left"
                >
                  {item.label}
                </button>
              ))}
              {onDemoClick && (
                <Button 
                  onClick={() => {
                    onDemoClick();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="border-[#FF914C] text-[#FF914C] hover:bg-[#FF914C] hover:text-white mt-4"
                >
                  Experimentar demonstração
                </Button>
              )}
              <Button onClick={onCTAClick} className="bg-black text-white hover:bg-gray-800 mt-4">
                Comece Agora
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
