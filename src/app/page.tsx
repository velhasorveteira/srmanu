"use client";

import Link from "next/link";
import { ArrowRight, Search, Star, ShieldCheck, Download, Compass, Database } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <header className="container mx-auto px-6 py-8 flex items-center justify-between relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-3 z-10"
        >
          <Image src="/logo.png" alt="Sr Manu Logo" width={60} height={40} className="object-contain" unoptimized priority />
        </motion.div>
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400 absolute left-1/2 -translate-x-1/2 z-10"
        >
          <Link href="#features" className="hover:text-indigo-400 transition-colors">Recursos</Link>
          <Link href="#pricing" className="hover:text-indigo-400 transition-colors">Planos</Link>
        </motion.nav>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center space-x-4 z-10"
        >
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="text-gray-300 hover:text-white font-medium transition-colors">Entrar</Button>
          </Link>
          <Link href="/cadastro">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 whitespace-nowrap text-sm px-4">
              Começar
            </Button>
          </Link>
        </motion.div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-28 text-center relative">
          {/* Luzes de Fundo (Efeito Glassmorphism/Glow) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10"
          />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-900/50 to-transparent"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-10 border border-indigo-500/20 shadow-inner"
          >
            <span className="flex w-2 h-2 rounded-full bg-indigo-400 mr-2 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
            O Maior Catálogo de Manuais e Catálogos Técnicos
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-tight"
          >
            Seu Acesso Imediato a <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Milhares de Manuais
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A ferramenta diária indispensável para engenheiros e técnicos. Encontre qualquer ficha técnica, manual de serviço ou catálogo de equipamentos em segundos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-5"
          >
            <Link href="/cadastro">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] rounded-xl transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] group">
                Acessar o Catálogo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard/documentos">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-gray-700/80 bg-gray-900/50 text-gray-300 hover:bg-gray-800 hover:text-white text-lg rounded-xl backdrop-blur-sm transition-all hover:-translate-y-1">
                Explorar Acervo
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative mt-12">
          <div className="absolute inset-0 bg-gray-900/50 border-y border-gray-800/60 -z-10"></div>
          <div className="container mx-auto px-6">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold mb-4 tracking-tight">O Fim das Buscas Frustrantes no Google</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Tudo organizado e preparado para você achar, consultar e salvar para acesso offline com um clique.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-950/50 p-8 rounded-3xl border border-gray-800/80 hover:border-indigo-500/30 transition-colors group"
              >
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Busca Organizada</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Navegação inteligente estruturada por Categorias e Marcas. Clique e encontre direto pela placa ou modelo do equipamento desejado.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-950/50 p-8 rounded-3xl border border-gray-800/80 hover:border-amber-500/30 transition-colors group"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7 text-amber-500 group-hover:fill-amber-500/20 transition-colors" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Meus Favoritos</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Sua mesa de trabalho particular. Favorite os manuais que você mais precisa e tenha-os disponíveis na hora em todos os seus dispositivos.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-950/50 p-8 rounded-3xl border border-gray-800/80 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Acervo Universal</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Puxado por uma rede viva e com o poder da comunidade técnica. Manuais e Fichas Técnicas inseridos por outros profissionais ficam disponíveis para todos.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-28 relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Assinaturas B2B</h2>
            <p className="text-gray-400 text-lg">Pague pouco pelo acesso completo a toda a biblioteca de conhecimento do mercado.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900/40 rounded-3xl p-10 border border-gray-800 backdrop-blur-sm lg:h-[90%] flex flex-col justify-between hover:border-gray-700 transition-colors"
            >
              <div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight">Visitante</h3>
                <p className="text-gray-500 mb-8 font-medium">Acesso limitado ao visualizador online</p>
                <div className="text-5xl font-extrabold mb-10 tracking-tight">
                  R$ 0<span className="text-xl text-gray-500 font-medium">/mês</span>
                </div>
                <ul className="space-y-5 text-gray-400 mb-10">
                  <li className="flex items-center">
                    <ShieldCheck className="w-6 h-6 text-gray-600 mr-4 flex-shrink-0" />
                    Ler via visualizador do site
                  </li>
                  <li className="flex items-center text-gray-600 opacity-60">
                    <Download className="w-6 h-6 mr-4 flex-shrink-0" />
                    <span className="line-through">Downloads de Documentos</span>
                  </li>
                  <li className="flex items-center text-gray-600 opacity-60">
                    <Star className="w-6 h-6 mr-4 flex-shrink-0" />
                    <span className="line-through">Aba "Meus Favoritos"</span>
                  </li>
                </ul>
              </div>
              <Link href="/cadastro">
                <Button className="w-full bg-gray-800/80 hover:bg-gray-700 text-white h-14 rounded-xl text-lg font-semibold transition-transform hover:scale-[1.02]">
                  Cadastrar Grátis
                </Button>
              </Link>
            </motion.div>

            {/* Pro Tier (Destaque) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-900/60 via-gray-900 to-gray-950 rounded-3xl p-10 border border-indigo-500/40 relative overflow-hidden shadow-2xl shadow-indigo-500/10 lg:scale-105 z-10 flex flex-col justify-between"
            >
              {/* Faixa Recomendado */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 to-violet-500"></div>
              <div className="absolute top-0 right-8 bg-indigo-500 text-xs font-bold px-4 py-1.5 rounded-b-lg text-white tracking-widest uppercase shadow-md shadow-indigo-500/20">Mais Escolhido</div>

              <div>
                <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">PRO</h3>
                <p className="text-indigo-300 mb-8 font-medium">A ferramenta completa na palma da mão</p>
                <div className="text-5xl font-extrabold mb-10 tracking-tight text-white flex items-end">
                  R$ 49,90<span className="text-xl text-indigo-200/50 font-medium ml-2 pb-1">/mês</span>
                </div>
                <ul className="space-y-5 text-gray-200 mb-10 font-medium">
                  <li className="flex items-center">
                    <Search className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0" />
                    Buscador Rápido Nível 3 (Marca/Cat)
                  </li>
                  <li className="flex items-center">
                    <Download className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0" />
                    Download Local de Todos Arquivos Ilimitado
                  </li>
                  <li className="flex items-center">
                    <Star className="w-6 h-6 text-amber-500 mr-4 flex-shrink-0" />
                    Aba Exclusiva de Favoritos
                  </li>
                  <li className="flex items-center">
                    <Database className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0" />
                    Upload Livre para o Repositório
                  </li>
                </ul>
              </div>
              <Link href="/cadastro">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-14 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]">
                  Assinar Acesso PRO
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900 py-12 text-center text-gray-500 text-sm mt-12 bg-gray-950">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Image src="/logo.png" alt="Logo Footer" width={40} height={25} className="object-contain opacity-70" unoptimized />
          <span className="font-semibold text-gray-400">Sr Manu</span>
        </div>
        <p>© 2026 Sr Manu. Todos os direitos reservados. Feito com rigor técnico.</p>
      </footer>
    </div>
  );
}
