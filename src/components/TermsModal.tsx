import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TermsModal({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-900 border-gray-800 text-gray-200 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white mb-4">Termos e Condições de Uso</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Por favor, leia atentamente as políticas que governam a utilização do Sr.Manu.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 text-sm mt-4 leading-relaxed pb-6">
                    <p className="font-semibold text-gray-300">
                        Última atualização: Fevereiro de 2026 | Versão 2.0
                    </p>
                    <p>
                        Por favor, leia atentamente os presentes Termos e Condições de Uso antes de acessar, criar uma conta ou utilizar qualquer funcionalidade da plataforma Sr.Manu. Este documento constitui um contrato juridicamente vinculante entre você (doravante denominado "Usuário") e a Sr.Manu (doravante denominada "Plataforma" ou "Empresa"). Ao utilizar a plataforma, você declara ter lido, compreendido e concordado integralmente com todas as disposições aqui previstas.
                    </p>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">1. Aceitação dos Termos</h3>
                        <p>
                            Ao criar uma conta, acessar a plataforma ou utilizar qualquer recurso do Sr.Manu — seja por meio de navegador web, aplicativo móvel, API ou qualquer outro meio disponibilizado — você concorda expressamente, de forma livre e consciente, com todos os termos e condições estabelecidos neste documento, bem como com nossa Política de Privacidade e demais políticas complementares que possam ser publicadas periodicamente.
                        </p>
                        <p className="mt-2">
                            Caso não concorde com qualquer disposição deste instrumento, você deve se abster de utilizar a plataforma. A continuidade do uso após eventuais atualizações dos termos será interpretada como aceitação tácita das modificações realizadas.
                        </p>
                        <p className="mt-2">
                            Menores de 18 (dezoito) anos somente poderão utilizar a plataforma mediante consentimento expresso de seus pais ou responsáveis legais, os quais assumirão solidariamente a responsabilidade pelo uso realizado.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">2. Cadastro e Segurança da Conta</h3>
                        <p>
                            Para acessar os recursos completos do Sr.Manu, o Usuário deverá realizar um cadastro, fornecendo informações verdadeiras, precisas, atuais e completas. O Usuário é integralmente responsável por:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Manter a confidencialidade de suas credenciais de acesso (login e senha);</li>
                            <li>Todas as atividades realizadas por meio de sua conta, independentemente de autorização ou conhecimento;</li>
                            <li>Notificar imediatamente a Sr.Manu em caso de acesso não autorizado, perda, roubo ou comprometimento de suas credenciais;</li>
                            <li>Manter seus dados cadastrais atualizados, especialmente endereço de e-mail e informações de contato.</li>
                        </ul>
                        <p className="mt-2 text-gray-400">
                            A Sr.Manu reserva-se o direito de suspender ou encerrar contas que apresentem informações falsas, incompletas ou desatualizadas, ou que estejam sendo utilizadas de forma fraudulenta ou contrária a estes Termos.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">3. Responsabilidade sobre os Arquivos</h3>
                        <p>
                            O Usuário é o único e exclusivo responsável por todo o conteúdo dos arquivos (documentos, manuais, PDFs, imagens, planilhas e quaisquer outros formatos suportados) que faz upload, armazena, compartilha ou disponibiliza por meio da plataforma Sr.Manu.
                        </p>
                        <p className="mt-2">
                            A Sr.Manu atua exclusivamente como prestadora de serviços de armazenamento em nuvem ("hosting"), não possuindo controle editorial sobre os conteúdos inseridos pelos usuários e não assumindo qualquer responsabilidade por:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Violações de direitos autorais, marcas registradas, patentes ou qualquer outro direito de propriedade intelectual de terceiros;</li>
                            <li>Conteúdos ilegais, difamatórios, caluniosos, injuriosos, obscenos, pornográficos, ofensivos, discriminatórios ou que incitem à violência ou ao ódio;</li>
                            <li>Conteúdos que violem a privacidade, a honra ou a imagem de terceiros, incluindo dados pessoais divulgados sem autorização;</li>
                            <li>Arquivos contendo vírus, malwares, ransomwares, spywares ou qualquer código malicioso que possa causar dano a sistemas ou terceiros;</li>
                            <li>A precisão, integridade, completude, atualidade ou qualidade técnica dos manuais, documentos e demais arquivos cadastrados;</li>
                            <li>Quaisquer prejuízos diretos ou indiretos causados a terceiros em decorrência do conteúdo dos arquivos armazenados pelo Usuário.</li>
                        </ul>
                        <p className="mt-2 font-medium text-gray-300">
                            O Usuário concorda em indenizar e isentar a Sr.Manu, seus sócios, administradores, colaboradores e parceiros de quaisquer reclamações, ações judiciais, perdas e danos, custos e honorários advocatícios decorrentes de violações a estas disposições.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">4. Arquivos Compartilhados (Públicos)</h3>
                        <p className="mb-2">
                            A plataforma Sr.Manu oferece ao Usuário a opção de tornar arquivos acessíveis para outros usuários por meio das funcionalidades de compartilhamento público. Ao optar por marcar um arquivo como "Compartilhado", "Público" ou qualquer configuração equivalente, o Usuário concorda expressamente que:
                        </p>

                        <h4 className="font-medium text-gray-300 mt-4 mb-1">4.1 Disponibilidade e Permanência</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>O arquivo será indexado e adicionado ao banco de dados generalizado da plataforma, podendo ser encontrado por mecanismos de busca internos;</li>
                            <li>O arquivo permanecerá disponível no banco de dados por tempo indeterminado, mesmo após a exclusão da conta de origem. A exclusão da conta implica apenas na anonimização dos dados do Usuário (soft delete), não na remoção do arquivo público do repositório coletivo;</li>
                            <li>O Usuário que desejar remover definitivamente um arquivo público deverá solicitar expressamente sua exclusão por meio dos canais de suporte, ficando a remoção sujeita à análise e aprovação da equipe Sr.Manu.</li>
                        </ul>

                        <h4 className="font-medium text-gray-300 mt-4 mb-1">4.2 Acesso e Uso por Terceiros</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Qualquer usuário devidamente cadastrado poderá pesquisar, visualizar, baixar e utilizar o conteúdo tornado público;</li>
                            <li>A Sr.Manu poderá utilizar arquivos públicos para fins de melhoria da plataforma, treinamento de algoritmos de busca e indexação;</li>
                            <li>O Usuário que tornar um arquivo público concede à Sr.Manu e aos demais usuários uma licença não exclusiva, gratuita, irrevogável e válida mundialmente para acessar e utilizar o conteúdo no âmbito da plataforma.</li>
                        </ul>

                        <h4 className="font-medium text-gray-300 mt-4 mb-1">4.3 Moderação e Remoção</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>A Sr.Manu reserva-se o direito de remover, suspender ou restringir o acesso a arquivos públicos que violem estes Termos a qualquer momento e sem aviso prévio;</li>
                            <li>Usuários que identificarem conteúdo público em desconformidade poderão reportá-lo por meio dos mecanismos de denúncia disponíveis na plataforma.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">5. Uso Permitido e Proibições</h3>
                        <p className="mb-2">O Usuário compromete-se a utilizar o Sr.Manu exclusivamente para fins lícitos. É expressamente vedado:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Armazenar, distribuir ou comercializar conteúdo protegido por direitos autorais sem a devida autorização do titular;</li>
                            <li>Realizar engenharia reversa, descompilar ou tentar acessar o código-fonte da plataforma;</li>
                            <li>Utilizar bots, scrapers ou qualquer mecanismo automatizado para coletar dados sem autorização prévia e por escrito;</li>
                            <li>Sobrecarregar deliberadamente a infraestrutura da plataforma por meio de ataques DDoS ou envio massivo de requisições;</li>
                            <li>Tentar acessar contas, sistemas ou dados de outros usuários sem autorização;</li>
                            <li>Revender, sublicenciar ou transferir o acesso à plataforma a terceiros sem autorização expressa;</li>
                            <li>Utilizar a plataforma para fins comerciais não autorizados, incluindo publicidade não solicitada (spam).</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">6. Proteção de Dados e Privacidade</h3>
                        <p>A Sr.Manu está comprometida com a proteção dos dados pessoais de seus Usuários, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018). O tratamento de dados pessoais está descrito detalhadamente em nossa Política de Privacidade, disponível em nosso site.</p>
                        <p className="mt-2">A Sr.Manu poderá coletar e tratar: informações de cadastro, dados de uso e navegação, metadados dos arquivos armazenados e informações de pagamento. Esses dados são utilizados para prestação dos serviços, melhoria da plataforma e cumprimento de obrigações legais.</p>
                        <p className="mt-2">O Usuário poderá exercer seus direitos de acesso, correção, portabilidade e exclusão previstos na LGPD mediante solicitação formal aos canais de atendimento da Sr.Manu.</p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">7. Disponibilidade, Segurança e Limitação de Responsabilidade</h3>
                        <p className="mb-2">O serviço é fornecido no estado em que se encontra ("as is"). O Usuário reconhece e concorda que:</p>

                        <h4 className="font-medium text-gray-300 mt-4 mb-1">7.1 Disponibilidade do Serviço</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>A Sr.Manu não garante que o serviço será 100% ininterrupto ou livre de erros;</li>
                            <li>Poderão ocorrer interrupções programadas para manutenção, comunicadas com antecedência sempre que possível;</li>
                            <li>Interrupções não programadas por falhas técnicas ou ataques cibernéticos podem ocorrer sem responsabilidade da Sr.Manu.</li>
                        </ul>

                        <h4 className="font-medium text-gray-300 mt-4 mb-1">7.2 Segurança e Backup</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>A Sr.Manu adota medidas técnicas e organizacionais razoáveis para proteger os dados, incluindo criptografia e controles de acesso;</li>
                            <li>A Sr.Manu isenta-se de responsabilidade por perdas decorrentes de ataques sofisticados ou circunstâncias fora de seu controle razoável;</li>
                            <li>Recomenda-se enfaticamente que o Usuário mantenha backups locais e independentes de todos os arquivos sensíveis, não utilizando o Sr.Manu como único repositório de informações críticas.</li>
                        </ul>

                        <h4 className="font-medium text-gray-300 mt-4 mb-1">7.3 Limitação de Responsabilidade</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>A Sr.Manu não será responsável por danos indiretos, incidentais, consequenciais ou punitivos, incluindo lucros cessantes ou perda de dados;</li>
                            <li>A responsabilidade total da Sr.Manu fica limitada ao valor pago pelo Usuário nos 3 (três) meses anteriores ao evento que originou o dano, ou a R$ 100,00 (cem reais), o que for maior.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">8. Propriedade Intelectual</h3>
                        <p>Todos os direitos de propriedade intelectual relativos à plataforma Sr.Manu — incluindo software, interface, logotipos, marcas, textos e algoritmos — são de titularidade exclusiva da Sr.Manu ou de seus licenciantes, protegidos pela legislação brasileira e internacional.</p>
                        <p className="mt-2">É vedada qualquer reprodução, distribuição, modificação ou criação de obras derivadas sem autorização prévia e por escrito da Sr.Manu.</p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">9. Planos, Pagamentos e Cancelamento</h3>
                        <p>A Sr.Manu poderá oferecer planos gratuitos e/ou pagos com diferentes limites e funcionalidades. Os preços e condições serão descritos na página de planos e poderão ser alterados com aviso prévio de 30 (trinta) dias.</p>
                        <p className="mt-2">O cancelamento de planos pagos poderá ser realizado a qualquer momento, sendo válido a partir do final do período já contratado. Não são realizados reembolsos proporcionais por períodos não utilizados, salvo disposição em contrário prevista na legislação aplicável.</p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">10. Modificações dos Termos e da Plataforma</h3>
                        <p>A Sr.Manu reserva-se o direito de modificar estes Termos a qualquer momento, mediante notificação prévia por e-mail, aviso no sistema ou publicação no site oficial, observando prazo mínimo de 15 (quinze) dias para alterações substanciais.</p>
                        <p className="mt-2">O uso continuado da plataforma após a entrada em vigor das alterações será considerado aceitação tácita dos novos termos.</p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">11. Rescisão e Encerramento de Conta</h3>
                        <p>O Usuário poderá encerrar sua conta a qualquer momento pelas configurações da plataforma ou via suporte. O encerramento implica a perda de acesso a todos os arquivos privados armazenados.</p>
                        <p className="mt-2">A Sr.Manu poderá suspender ou encerrar contas, com ou sem aviso prévio, em caso de violação destes Termos, uso fraudulento, solicitação de autoridades competentes ou por razões de segurança do sistema.</p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">12. Legislação Aplicável e Foro</h3>
                        <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de [cidade sede da empresa], Estado de [estado], com exclusão de qualquer outro, para dirimir quaisquer controvérsias decorrentes deste instrumento.</p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-white mb-2 text-base">13. Disposições Gerais</h3>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Se qualquer disposição destes Termos for considerada inválida, as demais permanecerão em pleno vigor;</li>
                            <li>A omissão da Sr.Manu em exercer qualquer direito não constitui renúncia a esse direito;</li>
                            <li>Estes Termos constituem o acordo integral entre o Usuário e a Sr.Manu, substituindo quaisquer acordos anteriores;</li>
                            <li>Em caso de dúvidas, entre em contato: <a href="mailto:suporte@srmanu.com.br" className="text-indigo-400 hover:text-indigo-300">suporte@srmanu.com.br</a></li>
                        </ul>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
