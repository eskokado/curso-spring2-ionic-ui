import { RefDTO } from "./ref.dto";
import { ItemPedidoDTO } from "./item-pedido.dto";

export interface PedidoDTO {
    cliente : RefDTO;
    enderecoDeEntrega : RefDTO;
    pagamento : PedidoDTO;
    itens : ItemPedidoDTO[];
}