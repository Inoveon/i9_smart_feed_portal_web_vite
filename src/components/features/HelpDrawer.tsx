import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getHelpFile } from '@/lib/help-mapping'

export function HelpDrawer() {
  const location = useLocation()
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadHelp = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const helpFile = getHelpFile(location.pathname)
        const response = await fetch(`/help/${helpFile}`)
        
        if (!response.ok) {
          // Tentar carregar help padrão se arquivo específico não existir
          const defaultResponse = await fetch('/help/default.md')
          if (defaultResponse.ok) {
            const text = await defaultResponse.text()
            setContent(text)
          } else {
            setError('Arquivo de ajuda não encontrado')
          }
        } else {
          const text = await response.text()
          setContent(text)
        }
      } catch (err) {
        setError('Erro ao carregar ajuda')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadHelp()
  }, [location.pathname])
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ajuda">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Ajuda</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {isLoading && (
            <div className="text-muted-foreground">Carregando...</div>
          )}
          
          {error && (
            <div className="text-destructive">{error}</div>
          )}
          
          {!isLoading && !error && content && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}